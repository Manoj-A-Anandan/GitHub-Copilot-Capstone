import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("page shell provides the app root and links local assets", async () => {
  const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");

  assert.match(html, /<main\b[^>]*id=["']app["']/i);
  assert.match(html, /href=["']\.\/styles\.css["']/i);
  assert.match(html, /src=["']\.\/app\.js["']/i);
  assert.doesNotMatch(html, /https?:\/\//i);
});
