import assert from "node:assert/strict";
import test from "node:test";
import { LocalStorageAdapter } from "../src/storage-adapter.js";
import { createStorageFixture } from "./fixtures/browser-fixtures.js";

test("NFR-6 storage read recovers valid distinct records and filters malformed entries", () => {
  const fixture = createStorageFixture({ value: JSON.stringify([
    { id: "a", title: "Good", status: "incomplete" },
    { id: "a", title: "Duplicate", status: "incomplete" },
    { id: "b", title: "  ", status: "incomplete" },
    null,
  ]) });
  const result = new LocalStorageAdapter(fixture.storage).read();
  assert.deepEqual(result.records, [{ id: "a", title: "Good", status: "incomplete" }]);
  assert.equal(result.skipped, true);
});

test("NFR-6 unreadable reads are contained and writes are atomic on failure", () => {
  const unreadable = createStorageFixture({ value: null, getItemError: new Error("secret detail") });
  const adapter = new LocalStorageAdapter(unreadable.storage);
  assert.equal(adapter.read().kind, "unreadable");

  const failed = createStorageFixture({ value: '[{"id":"old","title":"Old","status":"incomplete"}]', setItemError: new Error("secret detail") });
  const failedAdapter = new LocalStorageAdapter(failed.storage);
  assert.deepEqual(failedAdapter.write([{ id: "new", title: "New", status: "incomplete" }]), { success: false });
  assert.equal(failed.storage.getItem("tasks"), '[{"id":"old","title":"Old","status":"incomplete"}]');
  assert.equal(failed.observations.setItemCalls.length, 1);
});
