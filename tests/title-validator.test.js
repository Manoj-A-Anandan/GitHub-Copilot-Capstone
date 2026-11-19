import assert from "node:assert/strict";
import test from "node:test";
import { validateTitle, REQUIRED_TITLE_MESSAGE, OVERLENGTH_TITLE_MESSAGE } from "../src/title-validator.js";

test("FR-4 title validation rejects empty and whitespace exactly", () => {
  for (const title of ["", "   ", "\t\n"]) {
    assert.deepEqual(validateTitle(title), { valid: false, message: REQUIRED_TITLE_MESSAGE });
  }
});

test("FR-10 and Unicode boundaries preserve valid text", () => {
  assert.deepEqual(validateTitle("Complete Java revision"), { valid: true, title: "Complete Java revision" });
  const exactly255 = "😀".repeat(255);
  assert.equal(validateTitle(exactly255).valid, true);
  assert.deepEqual(validateTitle("a".repeat(256)), { valid: false, message: OVERLENGTH_TITLE_MESSAGE });
});
