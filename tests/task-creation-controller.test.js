import assert from "node:assert/strict";
import test from "node:test";
import { TaskCreationController, UNREADABLE_LOAD_MESSAGE, FAILED_SAVE_MESSAGE } from "../src/task-creation-controller.js";
import { InMemoryTaskState } from "../src/task-state.js";
import { StorageRecoveryState } from "../src/storage-recovery.js";
import { LocalStorageAdapter } from "../src/storage-adapter.js";
import { createDomFixture, createStorageFixture } from "./fixtures/browser-fixtures.js";

function setup(configuration = {}) {
  const dom = createDomFixture();
  const fixture = createStorageFixture(configuration);
  const state = new InMemoryTaskState();
  const recovery = new StorageRecoveryState();
  const adapter = new LocalStorageAdapter(fixture.storage);
  const input = dom.getElementById("title");
  const feedback = dom.getElementById("feedback");
  const list = dom.getElementById("task-list");
  const controller = new TaskCreationController({ state, recovery, adapter, input, feedback, list, idFactory: () => "id-1" });
  return { dom, fixture, state, recovery, adapter, input, feedback, list, controller };
}

test("FR-3/FR-7 successful create commits one snapshot, renders, and clears", () => {
  const s = setup({ value: null });
  s.input.value = "Created";
  const result = s.controller.submit();
  assert.equal(result.success, true);
  assert.equal(s.input.value, "");
  assert.equal(s.state.snapshotCopy()[0].status, "incomplete");
  assert.equal(s.fixture.observations.setItemCalls.length, 1);
});

test("invalid input performs no write and exact messages are shown", () => {
  const s = setup({ value: null });
  s.input.value = " ";
  s.controller.submit();
  assert.equal(s.feedback.textContent, "Task title is required and cannot be empty.");
  assert.equal(s.fixture.observations.setItemCalls.length, 0);
  s.input.value = "x".repeat(256);
  s.controller.submit();
  assert.equal(s.feedback.textContent, "Task title must be 255 characters or fewer.");
  assert.equal(s.fixture.observations.setItemCalls.length, 0);
});

test("blocked and failed-write submissions preserve input and list with exact feedback", () => {
  const blocked = setup({ value: null });
  blocked.recovery.enterUnreadableInitialLoad();
  blocked.input.value = "Still pending";
  blocked.controller.submit();
  assert.equal(blocked.feedback.textContent, UNREADABLE_LOAD_MESSAGE);
  assert.equal(blocked.input.value, "Still pending");
  assert.equal(blocked.fixture.observations.setItemCalls.length, 0);

  const failed = setup({ value: '[{"id":"old","title":"Old","status":"incomplete"}]', setItemError: new Error("detail") });
  failed.state.commit([{ id: "old", title: "Old", status: "incomplete" }]);
  failed.input.value = "Unsaved";
  failed.controller.submit();
  assert.equal(failed.feedback.textContent, FAILED_SAVE_MESSAGE);
  assert.equal(failed.input.value, "Unsaved");
  assert.deepEqual(failed.state.snapshotCopy().map((record) => record.title), ["Old"]);
});
