import assert from "node:assert/strict";
import test from "node:test";
import { StorageRecoveryState } from "../src/storage-recovery.js";
import { LocalStorageAdapter } from "../src/storage-adapter.js";
import { createStorageFixture } from "./fixtures/browser-fixtures.js";

test("FR-8/DR-1 recovery gate stays blocked until reread or explicit replacement", () => {
  const fixture = createStorageFixture({ value: "{", getItemError: new Error("detail") });
  const adapter = new LocalStorageAdapter(fixture.storage);
  const recovery = new StorageRecoveryState();
  recovery.enterUnreadableInitialLoad();
  assert.equal(recovery.isBlocked(), true);

  fixture.reset({ value: "{", getItemError: new Error("detail") });
  assert.equal(recovery.reread(adapter).success, false);
  assert.equal(recovery.isBlocked(), true);

  fixture.reset({ value: '[{"id":"a","title":"Restored","status":"incomplete"}]' });
  const reread = recovery.reread(adapter);
  assert.equal(reread.success, true);
  assert.equal(recovery.isBlocked(), false);
  assert.equal(reread.result.records[0].title, "Restored");

  const blocked = new StorageRecoveryState();
  blocked.enterUnreadableInitialLoad();
  assert.equal(blocked.confirmReplacement(), true);
  assert.equal(blocked.isBlocked(), false);
});
