import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryTaskState } from "../src/task-state.js";

test("FR-3/FR-6 task state orders distinct same-title records and defaults incomplete", () => {
  const state = new InMemoryTaskState();
  const first = state.createCandidate("Same", "id-1");
  assert.equal(first.status, "incomplete");
  state.commit([first]);
  const second = state.createCandidate("Same", "id-2");
  state.commit([...state.snapshotCopy(), second]);
  assert.deepEqual(state.snapshotCopy().map((record) => record.title), ["Same", "Same"]);
  assert.equal(state.snapshotCopy()[1].id, "id-2");
});

test("uncommitted candidates do not alter snapshots", () => {
  const state = new InMemoryTaskState([{ id: "one", title: "First", status: "incomplete" }]);
  state.createCandidate("Second", "two");
  assert.deepEqual(state.snapshotCopy().map((record) => record.title), ["First"]);
});
