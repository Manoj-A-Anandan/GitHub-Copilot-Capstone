import assert from "node:assert/strict";
import test from "node:test";
import {
  createDomFixture,
  createStorageFixture,
  deterministicRecords,
  storageValues,
} from "./fixtures/browser-fixtures.js";

test("DOM fixtures and deterministic records are isolated and resettable", () => {
  const firstDom = createDomFixture();
  const secondDom = createDomFixture();
  const firstRecords = deterministicRecords();
  const secondRecords = deterministicRecords();

  firstDom.getElementById("title").value = "fixture-only";
  firstRecords[0].title = "fixture-only";
  assert.equal(secondDom.getElementById("title").value, "");
  assert.notEqual(secondRecords[0].title, "fixture-only");

  firstDom.reset();
  assert.equal(firstDom.getElementById("title").value, "");
  assert.equal(firstDom.getElementById("title").children.length, 0);
});

test("storage fixtures distinguish absent, malformed, readable, and unreadable values", () => {
  const absent = createStorageFixture(storageValues.absent);
  const malformed = createStorageFixture(storageValues.malformed);
  const readable = createStorageFixture(storageValues.readable);
  const unreadable = createStorageFixture(storageValues.unreadable);

  assert.equal(absent.storage.getItem("tasks"), null);
  assert.equal(malformed.storage.getItem("tasks"), "{");
  assert.equal(readable.storage.getItem("tasks"), '[{"id":"fixture-1"}]');
  assert.throws(() => unreadable.storage.getItem("tasks"));
  assert.deepEqual(unreadable.observations.getItemCalls, ["tasks"]);
});

test("storage fixtures observe writes, inject errors, and reset independently", () => {
  const storageFixture = createStorageFixture({
    value: "before",
    setItemError: new Error("storage detail"),
  });

  assert.throws(() => storageFixture.storage.setItem("tasks", "after"));
  assert.deepEqual(storageFixture.observations.setItemCalls, [
    { key: "tasks", value: "after" },
  ]);
  assert.equal(storageFixture.storage.getItem("tasks"), "before");

  storageFixture.reset({ value: "reset-value" });
  assert.deepEqual(storageFixture.observations.setItemCalls, []);
  assert.deepEqual(storageFixture.observations.getItemCalls, []);
  assert.equal(storageFixture.storage.getItem("tasks"), "reset-value");
});
