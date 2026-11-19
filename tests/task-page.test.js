import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("NFR-4 task page contains controls and separate recovery actions", async () => {
  const html = await readFile(new URL("../src/index.html", import.meta.url), "utf8");
  assert.match(html, /id="title"/);
  assert.match(html, />Add Task</);
  assert.match(html, /id="feedback"/);
  assert.match(html, /id="reread-tasks"/);
  assert.match(html, /id="replace-tasks"/);
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  assert.match(css, /min-width:\s*0/);
});
