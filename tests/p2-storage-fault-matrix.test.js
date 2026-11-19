import assert from "node:assert/strict";
import test from "node:test";
import { initializeApp } from "../src/app.js";
import { createDomFixture, createStorageFixture } from "./fixtures/browser-fixtures.js";

const UNREADABLE_MESSAGE =
  "Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.";
const FAILED_SAVE_MESSAGE = "Unable to save the task. Please try again.";

function createApp(storageFixture) {
  const dom = createDomFixture();
  const ids = ["title", "task-form", "feedback", "task-list", "reread-tasks", "replace-tasks"];
  const elements = new Map(
    ids.map((id) => {
      const element = dom.document.createElement(id === "title" ? "input" : "div");
      element.id = id;
      element.ownerDocument = dom.document;
      return [id, element];
    }),
  );
  const documentLike = {
    createElement(tagName) {
      const element = dom.document.createElement(tagName);
      element.ownerDocument = documentLike;
      return element;
    },
    getElementById: (id) => elements.get(id) ?? null,
  };
  const app = initializeApp(documentLike, storageFixture.storage);
  return { app, elements };
}

function submit(elements, title) {
  elements.get("title").value = title;
  elements.get("task-form").dispatchEvent({
    type: "submit",
    preventDefault() {},
  });
}

function taskTitles(elements) {
  return elements.get("task-list").children.map((item) => item.children[0].textContent);
}

function withWindow(windowLike, callback) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowLike,
  });
  try {
    callback();
  } finally {
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow);
    } else {
      delete globalThis.window;
    }
  }
}

test("T-20 unreadable whole storage values load zero tasks and block writes", () => {
  const cases = [
    ["read exception", { value: null, getItemError: new Error("private storage detail") }],
    ["empty text", { value: "" }],
    ["invalid JSON", { value: "{" }],
    ["wrong top-level shape", { value: '{"id":"saved","title":"Saved","status":"incomplete"}' }],
  ];

  for (const [label, configuration] of cases) {
    const fixture = createStorageFixture(configuration);
    const { app, elements } = createApp(fixture);

    assert.ok(app, `${label}: app initializes`);
    assert.equal(elements.get("task-list").children.length, 0, `${label}: no tasks load`);
    assert.equal(elements.get("feedback").textContent, UNREADABLE_MESSAGE, `${label}: exact feedback`);
    assert.equal(app.recovery.isBlocked(), true, `${label}: writes are blocked`);

    assert.doesNotThrow(() => submit(elements, "Must not overwrite unreadable data"));
    assert.equal(fixture.observations.setItemCalls.length, 0, `${label}: no setItem call`);
    assert.equal(elements.get("task-list").children.length, 0, `${label}: task list stays empty`);
    assert.equal(elements.get("title").value, "Must not overwrite unreadable data");
    assert.equal(elements.get("feedback").textContent, UNREADABLE_MESSAGE);
  }
});

test("T-20 malformed arrays retain valid distinct records and skip malformed and duplicate IDs", () => {
  const fixture = createStorageFixture({
    value: JSON.stringify([
      { id: "one", title: "Keep one", status: "incomplete" },
      null,
      { id: "one", title: "Skip duplicate", status: "incomplete" },
      { id: "two", title: "Keep two", status: "incomplete" },
      { id: "three", title: " ", status: "incomplete" },
      { id: "four", title: "Wrong status", status: "complete" },
    ]),
  });
  const { app, elements } = createApp(fixture);

  assert.equal(app.recovery.isBlocked(), false);
  assert.deepEqual(taskTitles(elements), ["Keep one", "Keep two"]);
  assert.equal(elements.get("task-list").children.length, 2);
  assert.equal(elements.get("feedback").textContent, "Some malformed saved tasks were skipped.");
});

test("Replace saved tasks is unavailable and cannot clear readable saved tasks", () => {
  const savedValue =
    '[{"id":"saved","title":"Keep saved task","status":"incomplete"}]';
  const fixture = createStorageFixture({ value: savedValue });
  const { app, elements } = createApp(fixture);
  const replace = elements.get("replace-tasks");

  assert.equal(app.recovery.isBlocked(), false);
  assert.equal(replace.hidden, true);
  assert.equal(replace.disabled, true);

  let confirmationCalls = 0;
  withWindow({
    confirm() {
      confirmationCalls += 1;
      return true;
    },
  }, () => {
    replace.dispatchEvent({ type: "click" });
  });

  assert.equal(confirmationCalls, 0);
  assert.deepEqual(taskTitles(elements), ["Keep saved task"]);
  assert.deepEqual(app.state.snapshotCopy(), [
    { id: "saved", title: "Keep saved task", status: "incomplete" },
  ]);
  assert.equal(fixture.storage.getItem("tasks"), savedValue);
  assert.equal(fixture.observations.setItemCalls.length, 0);
});

test("T-20 blocked submission makes no write; successful reread releases the gate", () => {
  const fixture = createStorageFixture({
    value: null,
    getItemError: new Error("injected read failure"),
  });
  const { app, elements } = createApp(fixture);
  assert.equal(app.recovery.isBlocked(), true);
  const replace = elements.get("replace-tasks");
  assert.equal(replace.hidden, false);
  assert.equal(replace.disabled, false);

  submit(elements, "Blocked attempt");
  assert.equal(fixture.observations.setItemCalls.length, 0);
  assert.equal(elements.get("feedback").textContent, UNREADABLE_MESSAGE);
  assert.equal(elements.get("title").value, "Blocked attempt");

  fixture.reset({
    value: '[{"id":"restored","title":"Recovered task","status":"incomplete"}]',
  });
  assert.doesNotThrow(() => {
    elements.get("reread-tasks").dispatchEvent({ type: "click" });
  });
  assert.equal(app.recovery.isBlocked(), false);
  assert.equal(replace.hidden, true);
  assert.equal(replace.disabled, true);
  assert.deepEqual(taskTitles(elements), ["Recovered task"]);
  assert.equal(elements.get("feedback").textContent, "");

  submit(elements, "Write after reread");
  assert.equal(fixture.observations.setItemCalls.length, 1);
  assert.deepEqual(taskTitles(elements), ["Recovered task", "Write after reread"]);
  assert.equal(elements.get("feedback").textContent, "");
});

test("T-20 explicit replacement releases writes and a failed write remains atomic", () => {
  const originalValue = "{ unreadable saved representation";
  const fixture = createStorageFixture({ value: originalValue });
  const { app, elements } = createApp(fixture);
  assert.equal(app.recovery.isBlocked(), true);
  const replace = elements.get("replace-tasks");
  assert.equal(replace.hidden, false);
  assert.equal(replace.disabled, false);

  withWindow({ confirm: () => true }, () => {
    assert.doesNotThrow(() => {
      elements.get("replace-tasks").dispatchEvent({ type: "click" });
    });
  });
  assert.equal(app.recovery.isBlocked(), false);
  assert.equal(replace.hidden, true);
  assert.equal(replace.disabled, true);
  assert.equal(elements.get("feedback").textContent, "");
  assert.equal(elements.get("task-list").children.length, 0);

  fixture.reset({ value: originalValue, setItemError: new Error("private write detail") });
  submit(elements, "Cannot persist after replacement");

  assert.equal(fixture.observations.setItemCalls.length, 1);
  assert.deepEqual(taskTitles(elements), []);
  assert.equal(elements.get("title").value, "Cannot persist after replacement");
  assert.equal(elements.get("feedback").textContent, FAILED_SAVE_MESSAGE);
  assert.equal(fixture.storage.getItem("tasks"), originalValue);
  assert.equal(app.state.snapshotCopy().length, 0);
});
