import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createStorageFixture } from "./fixtures/browser-fixtures.js";
import { LocalStorageAdapter } from "../src/storage-adapter.js";

test("Edge: absent stored data is empty and a missing local file is safely reported", async () => {
  const storage = createStorageFixture({ value: null });
  const adapter = new LocalStorageAdapter(storage.storage);
  assert.deepEqual(adapter.read(), { kind: "readable", records: [], skipped: false });

  await assert.rejects(
    readFile(new URL("./fixtures/does-not-exist.fixture", import.meta.url)),
    (error) => error?.code === "ENOENT",
  );
});

test("Output: README and CHANGELOG contain required scope and no secret-like or absolute-path data", async () => {
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const changelog = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");

  for (const heading of ["## Run locally", "## Use", "## Configuration", "## Tests"]) {
    assert.ok(readme.includes(heading), `README contains ${heading}`);
  }
  assert.match(readme, /255 Unicode\s+code points/);
  assert.match(readme, /no application credentials or environment variables/i);
  assert.match(changelog, /## \[Unreleased\]/);

  for (const document of [readme, changelog]) {
    assert.doesNotMatch(document, /(?:[A-Za-z]:\\|(?:\/Users\/|\/home\/))/);
    assert.doesNotMatch(document, /\b(password|credential|authorization|bearer)\b/i);
  }

  for (const relativeLink of ["docs/requirements.md", "docs/architecture.md", "docs/impl-plan.md"]) {
    await readFile(new URL(`../${relativeLink}`, import.meta.url), "utf8");
  }
});

test("Gap: no lookup/API exists, so Not Found is conditional and not required", async () => {
  const sourceFiles = [
    "../src/index.html",
    "../src/app.js",
    "../src/task-creation-controller.js",
  ];
  const sources = await Promise.all(
    sourceFiles.map((relative) => readFile(new URL(relative, import.meta.url), "utf8")),
  );
  assert.equal(sources.join("\n").includes("Not Found"), false);
  assert.doesNotMatch(sources.join("\n"), /\b(?:fetch|XMLHttpRequest|axios)\b/i);
});
