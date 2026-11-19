import assert from "node:assert/strict";
import test from "node:test";
import { initializeApp } from "../src/app.js";
import { createDomFixture, createStorageFixture } from "./fixtures/browser-fixtures.js";

test("FR-1–FR-10 integrated create and refresh restoration flow", () => {
  const dom = createDomFixture();
  dom.document.querySelector = () => dom.document.getElementById("app");
  dom.document.getElementById("app");
  const elements = ["title", "task-form", "feedback", "task-list", "reread-tasks", "replace-tasks"];
  for (const id of elements) {
    if (!dom.getElementById(id)) {
      const element = dom.document.createElement(id === "title" ? "input" : "div");
      element.id = id;
      dom.document.elements?.set?.(id, element);
    }
  }

  const fixture = createStorageFixture({ value: null });
  const appElements = new Map();
  for (const id of elements) {
    const element = dom.document.createElement(id === "title" ? "input" : "div");
    element.id = id;
    appElements.set(id, element);
  }
  const documentLike = {
    createElement: (tagName) => {
      const element = dom.document.createElement(tagName);
      element.ownerDocument = documentLike;
      return element;
    },
    getElementById: (id) => appElements.get(id) ?? null,
  };
  const storage = fixture.storage;
  const app = initializeApp(documentLike, storage);
  assert.ok(app);
  appElements.get("title").value = "Refresh me";
  appElements.get("task-form").dispatchEvent({ type: "submit", preventDefault() {} });
  assert.equal(appElements.get("title").value, "");
  assert.equal(appElements.get("task-list").children.length, 1);

  const restoredDom = new Map();
  for (const id of elements) {
    const element = documentLike.createElement(id === "title" ? "input" : "div");
    element.id = id;
    restoredDom.set(id, element);
  }
  const restoredDocument = { createElement: documentLike.createElement, getElementById: (id) => restoredDom.get(id) ?? null };
  initializeApp(restoredDocument, storage);
  assert.equal(restoredDom.get("task-list").children.length, 1);
  assert.equal(restoredDom.get("task-list").children[0].children[0].textContent, "Refresh me");
});

test("NFR-6 throwing localStorage getter enters unreadable blocked state", () => {
  const dom = createDomFixture();
  const ids = ["title", "task-form", "feedback", "task-list", "reread-tasks", "replace-tasks"];
  const elements = new Map(
    ids.map((id) => [id, dom.document.createElement(id === "title" ? "input" : "div")]),
  );
  const documentLike = {
    createElement: dom.document.createElement,
    getElementById: (id) => elements.get(id) ?? null,
  };
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let getterCalls = 0;
  const throwingWindow = {};
  Object.defineProperty(throwingWindow, "localStorage", {
    get() {
      getterCalls += 1;
      throw new Error("storage access denied");
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: throwingWindow,
  });

  try {
    let app;
    assert.doesNotThrow(() => {
      app = initializeApp(documentLike);
    });
    assert.equal(getterCalls, 1);
    assert.equal(elements.get("feedback").textContent,
      "Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.");
    assert.equal(elements.get("task-list").children.length, 0);
    assert.equal(app.recovery.isBlocked(), true);
    assert.deepEqual(app.adapter.read(), {
      kind: "unreadable",
      records: [],
      skipped: false,
    });

    let writeCalls = 0;
    const adapterWrite = app.adapter.write.bind(app.adapter);
    app.adapter.write = (...args) => {
      writeCalls += 1;
      return adapterWrite(...args);
    };
    elements.get("title").value = "Keep this title";
    elements.get("task-form").dispatchEvent({
      type: "submit",
      preventDefault() {},
    });
    assert.equal(writeCalls, 0);
    assert.equal(elements.get("title").value, "Keep this title");
    assert.equal(elements.get("task-list").children.length, 0);
    assert.equal(elements.get("feedback").textContent,
      "Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.");
  } finally {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      delete globalThis.window;
    }
  }
});
