import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const browserProfilePrefix = ".tmp-p2-browser-";
const browserPaths = [
  process.env.BROWSER_BIN,
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env["ProgramFiles(x86)"] && path.join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.ProgramFiles && path.join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["ProgramFiles(x86)"] && path.join(process.env["ProgramFiles(x86)"], "Google", "Chrome", "Application", "chrome.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"),
].filter(Boolean);

function findBrowser() {
  return browserPaths.find((browserPath) => existsSync(browserPath));
}

function createStaticServer() {
  const files = new Map([
    ["/src/index.html", ["src/index.html", "text/html; charset=utf-8"]],
    ["/src/styles.css", ["src/styles.css", "text/css; charset=utf-8"]],
    ["/src/app.js", ["src/app.js", "text/javascript; charset=utf-8"]],
    ["/src/storage-adapter.js", ["src/storage-adapter.js", "text/javascript; charset=utf-8"]],
    ["/src/storage-recovery.js", ["src/storage-recovery.js", "text/javascript; charset=utf-8"]],
    ["/src/task-creation-controller.js", ["src/task-creation-controller.js", "text/javascript; charset=utf-8"]],
    ["/src/task-list-renderer.js", ["src/task-list-renderer.js", "text/javascript; charset=utf-8"]],
    ["/src/task-state.js", ["src/task-state.js", "text/javascript; charset=utf-8"]],
    ["/src/title-validator.js", ["src/title-validator.js", "text/javascript; charset=utf-8"]],
  ]);
  return createServer((request, response) => {
    const requestPath = new URL(request.url, "http://127.0.0.1").pathname;
    const file = files.get(requestPath);
    if (!file) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { "content-type": file[1], "cache-control": "no-store" });
    response.end(readFileSync(path.join(workspaceRoot, file[0])));
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function waitForDevTools(browser, profilePath) {
  const activePortPath = path.join(profilePath, "DevToolsActivePort");
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (browser.exitCode !== null) {
      throw new Error("The browser exited before DevTools became available.");
    }
    if (existsSync(activePortPath)) {
      const [portLine] = readFileSync(activePortPath, "utf8").split(/\r?\n/);
      const port = Number(portLine);
      if (Number.isInteger(port) && port > 0) {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`).catch(() => null);
        if (response?.ok) return { port, version: await response.json() };
      }
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for the browser's local DevTools endpoint.");
}

class DevToolsConnection {
  constructor(webSocket) {
    this.webSocket = webSocket;
    this.nextId = 0;
    this.pending = new Map();
    this.eventWaiters = [];
    webSocket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id !== undefined) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result ?? {});
        }
        return;
      }
      const waiterIndex = this.eventWaiters.findIndex((waiter) =>
        waiter.method === message.method &&
        (!waiter.sessionId || waiter.sessionId === message.sessionId));
      if (waiterIndex >= 0) {
        const [waiter] = this.eventWaiters.splice(waiterIndex, 1);
        waiter.resolve(message.params ?? {});
      }
    });
    webSocket.addEventListener("close", () => {
      for (const pending of this.pending.values()) {
        pending.reject(new Error("The browser DevTools connection closed."));
      }
      this.pending.clear();
    });
  }

  static async connect(url) {
    const webSocket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      webSocket.addEventListener("open", resolve, { once: true });
      webSocket.addEventListener("error", () => reject(new Error("Could not connect to browser DevTools.")), { once: true });
    });
    return new DevToolsConnection(webSocket);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const command = { id, method, params };
    if (sessionId) command.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.webSocket.send(JSON.stringify(command));
    });
  }

  waitForEvent(method, sessionId) {
    return new Promise((resolve) => {
      this.eventWaiters.push({ method, sessionId, resolve });
    });
  }

  close() {
    this.webSocket.close();
  }
}

async function evaluate(connection, sessionId, expression) {
  const response = await connection.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (response.exceptionDetails) {
    throw new Error("A browser acceptance expression failed.");
  }
  return response.result?.value;
}

async function clickSelector(connection, sessionId, selector) {
  const rect = await evaluate(
    connection,
    sessionId,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    })()`,
  );
  assert.ok(rect, `Expected visible control ${selector}`);
  await connection.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: rect.x,
    y: rect.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
  await connection.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: rect.x,
    y: rect.y,
    button: "left",
    clickCount: 1,
  }, sessionId);
}

async function enterAndSubmit(connection, sessionId, title) {
  await clickSelector(connection, sessionId, "#title");
  await connection.send("Input.insertText", { text: title }, sessionId);
  await clickSelector(connection, sessionId, "#add-task");
  return evaluate(connection, sessionId, `(() => ({
    input: document.getElementById("title").value,
    feedback: document.getElementById("feedback").textContent,
    tasks: Array.from(document.querySelectorAll("#task-list li"), (item) => ({
      title: item.children[0].textContent,
      status: item.children[1].textContent
    })),
    stored: JSON.parse(localStorage.getItem("tasks") || "[]")
  }))()`);
}

async function assertViewportControls(
  connection,
  sessionId,
  width,
  height,
  mobile,
  replacementAvailable = false,
) {
  await connection.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  }, sessionId);
  const result = await evaluate(connection, sessionId, `(() => {
    const selectors = ["#title", "#add-task", "#reread-tasks"];
    const controls = selectors.map((selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        selector,
        visible: style.display !== "none" && style.visibility !== "hidden" &&
          rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.right <= innerWidth &&
          rect.top >= 0 && rect.bottom <= innerHeight,
        operable: !element.disabled,
      };
    });
    const replacement = document.querySelector("#replace-tasks");
    const replacementStyle = getComputedStyle(replacement);
    const replacementRect = replacement.getBoundingClientRect();
    return {
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      controls,
      replacement: {
        visible: replacementStyle.display !== "none" &&
          replacementStyle.visibility !== "hidden" &&
          replacementRect.width > 0 && replacementRect.height > 0,
        operable: !replacement.disabled,
      },
    };
  })()`);
  assert.equal(result.width, width);
  assert.ok(result.scrollWidth <= width, `No horizontal overflow at ${width}px`);
  for (const control of result.controls) {
    assert.ok(control.visible, `${control.selector} is visible at ${width}px`);
    assert.ok(control.operable, `${control.selector} is enabled at ${width}px`);
  }
  assert.equal(result.replacement.visible, replacementAvailable,
    `Replace saved tasks visibility matches recovery state at ${width}px`);
  assert.equal(result.replacement.operable, replacementAvailable,
    `Replace saved tasks availability matches recovery state at ${width}px`);
}

async function stopBrowser(browser, browserConnection) {
  if (browserConnection) {
    try {
      await browserConnection.send("Browser.close");
    } catch {
      // The browser may have already exited after a failed acceptance check.
    }
    browserConnection.close();
  }
  if (!browser || browser.exitCode !== null) return;
  await Promise.race([once(browser, "exit"), delay(5000)]);
  if (browser.exitCode === null) {
    browser.kill();
    await Promise.race([once(browser, "exit"), delay(2000)]);
  }
}

async function exerciseRecoveryControls(connection, sessionId) {
  await clickSelector(connection, sessionId, "#reread-tasks");
}

test("T-21 real-browser security, responsive controls, and isolated-origin refresh", async (t) => {
  const browserPath = findBrowser();
  assert.ok(
    browserPath,
    "T-21 requires an installed Edge/Chrome browser or BROWSER_BIN pointing to one.",
  );

  const profileRoot = mkdtempSync(path.join(workspaceRoot, browserProfilePrefix));
  const profilePath = path.join(profileRoot, "profile");
  const server = createStaticServer();
  let browser;
  let connection;
  let browserConnection;
  try {
    const port = await listen(server);
    const browserUrl = `http://127.0.0.1:${port}/src/index.html`;
    browser = spawn(browserPath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-extensions",
      "--disable-sync",
      "--remote-debugging-port=0",
      `--user-data-dir=${profilePath}`,
      "about:blank",
    ], { stdio: "ignore" });

    const devTools = await waitForDevTools(browser, profilePath);
    browserConnection = await DevToolsConnection.connect(devTools.version.webSocketDebuggerUrl);
    const target = await fetch(`http://127.0.0.1:${devTools.port}/json/new?about%3Ablank`, {
      method: "PUT",
    }).then((response) => {
      if (!response.ok) throw new Error("Could not create an isolated browser page.");
      return response.json();
    });
    connection = await DevToolsConnection.connect(target.webSocketDebuggerUrl);
    await connection.send("Page.enable");
    await connection.send("Runtime.enable");
    const pageReady = connection.waitForEvent("Page.loadEventFired");
    await connection.send("Page.navigate", { url: browserUrl });
    await pageReady;

    const initialStorage = await evaluate(
      connection,
      undefined,
      "localStorage.getItem('tasks')",
    );
    assert.equal(initialStorage, null, "The isolated test origin starts with empty storage.");

    const hostileTitle =
      '<img src=x onerror="window.__titleExecuted=true"><script>window.__titleExecuted=true</script>';
    await evaluate(connection, undefined, "window.__titleExecuted = false");
    await assertViewportControls(connection, undefined, 320, 800, true);
    await exerciseRecoveryControls(connection, undefined);
    const mobileResult = await enterAndSubmit(connection, undefined, hostileTitle);
    assert.equal(mobileResult.input, "");
    assert.equal(mobileResult.feedback, "");
    assert.deepEqual(mobileResult.tasks, [{ title: hostileTitle, status: "incomplete" }]);
    assert.equal(mobileResult.stored.length, 1);
    assert.equal(mobileResult.stored[0].title, hostileTitle);

    await delay(250);
    const executionCheck = await evaluate(connection, undefined, `({
      executed: window.__titleExecuted,
      markupCreated: document.querySelector("#task-list img, #task-list script") !== null
    })`);
    assert.equal(executionCheck.executed, false, "HTML-like title content does not execute.");
    assert.equal(executionCheck.markupCreated, false, "HTML-like title content creates no executable markup.");

    await assertViewportControls(connection, undefined, 1280, 900, false);
    await exerciseRecoveryControls(connection, undefined);
    const desktopResult = await enterAndSubmit(connection, undefined, "Desktop viewport task");
    assert.equal(desktopResult.input, "");
    assert.deepEqual(desktopResult.tasks.map((task) => task.title), [
      hostileTitle,
      "Desktop viewport task",
    ]);

    const additionalResult = await enterAndSubmit(connection, undefined, "Another saved task");
    assert.equal(additionalResult.input, "");
    const savedTitles = additionalResult.stored.map((task) => task.title);
    assert.deepEqual(savedTitles, [
      hostileTitle,
      "Desktop viewport task",
      "Another saved task",
    ]);
    assert.ok(additionalResult.stored.every((task) => task.status === "incomplete"));

    const refreshed = connection.waitForEvent("Page.loadEventFired");
    await connection.send("Page.reload", { ignoreCache: true });
    await refreshed;
    const restored = await evaluate(connection, undefined, `({
      rendered: Array.from(document.querySelectorAll("#task-list li"), (item) => ({
        title: item.children[0].textContent,
        status: item.children[1].textContent
      })),
      stored: JSON.parse(localStorage.getItem("tasks") || "[]")
    })`);
    assert.deepEqual(restored.rendered, savedTitles.map((title) => ({
      title,
      status: "incomplete",
    })));
    assert.deepEqual(restored.stored.map((task) => task.title), savedTitles);
    assert.ok(restored.stored.every((task) => task.status === "incomplete"));

    await evaluate(connection, undefined, `localStorage.setItem("tasks", "{ unreadable")`);
    const blockedLoad = connection.waitForEvent("Page.loadEventFired");
    await connection.send("Page.reload", { ignoreCache: true });
    await blockedLoad;
    await assertViewportControls(connection, undefined, 320, 800, true, true);
    const blockedFeedback = await evaluate(
      connection,
      undefined,
      `document.querySelector("#feedback").textContent`,
    );
    assert.equal(
      blockedFeedback,
      "Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.",
    );
    await clickSelector(connection, undefined, "#reread-tasks");
    await evaluate(connection, undefined, `window.confirm = (message) => {
      window.__replaceConfirmation = message;
      return true;
    }`);
    await clickSelector(connection, undefined, "#replace-tasks");
    const replacementResult = await evaluate(connection, undefined, `({
      confirmation: window.__replaceConfirmation,
      hidden: document.querySelector("#replace-tasks").hidden,
      disabled: document.querySelector("#replace-tasks").disabled,
      feedback: document.querySelector("#feedback").textContent,
      taskCount: document.querySelectorAll("#task-list li").length
    })`);
    assert.equal(
      replacementResult.confirmation,
      "Replace unreadable saved tasks? This can discard them.",
    );
    assert.equal(replacementResult.hidden, true);
    assert.equal(replacementResult.disabled, true);
    assert.equal(replacementResult.feedback, "");
    assert.equal(replacementResult.taskCount, 0);
    t.diagnostic(`Browser acceptance ran with ${path.basename(browserPath)}.`);
  } finally {
    await stopBrowser(browser, browserConnection);
    connection?.close();
    await closeServer(server);
    await delay(200);
    rmSync(profileRoot, { recursive: true, force: true });
  }
});
