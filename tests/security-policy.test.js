import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = new URL("../", import.meta.url);

test("NFR-8: environment example states that no variables are required", async () => {
  const contents = await readFile(new URL(".env.example", repositoryRoot), "utf8");
  const ignoreRules = await readFile(new URL(".gitignore", repositoryRoot), "utf8");

  assert.equal(
    contents.replace(/\r\n/g, "\n"),
    "# No environment variables are required.\n",
  );
  assert.match(ignoreRules, /^\.env$/m);
  assert.match(ignoreRules, /^\.env\.\*$/m);
  assert.match(ignoreRules, /^!\.env\.example$/m);
});

test("NFR-8: app has no credential or external-service integration", async () => {
  const sourceFiles = await readdir(new URL("../src/", import.meta.url));
  const appSources = await Promise.all(
    sourceFiles
      .filter((name) => /\.(html|css|js)$/i.test(name))
      .map((name) => readFile(new URL(`../src/${name}`, import.meta.url), "utf8")),
  );
  const source = appSources.join("\n");
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.doesNotMatch(
    source,
    /(?:process\.env|\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b)/i,
  );
  assert.doesNotMatch(source, /\b(password|secret|token|credential|authorization)\b/i);
  assert.doesNotMatch(source, /\bconsole\.(log|error|warn)\s*\(/);
  assert.equal(packageJson.dependencies, undefined);
  assert.equal(packageJson.devDependencies, undefined);
});

test("NFR-8: test diagnostics do not echo seeded sensitive fixture values", () => {
  const fakeValues = [
    "FAKE_TEST_CREDENTIAL_VALUE",
    "FAKE_TASK_TITLE_VALUE",
    "FAKE_STORAGE_EXCEPTION_DETAIL",
  ];
  const child = spawnSync(
    process.execPath,
    ["--test", "tests/page-shell.test.js"],
    {
      cwd: new URL("../", import.meta.url),
      encoding: "utf8",
      env: {
        PATH: process.env.PATH ?? "",
        SystemRoot: process.env.SystemRoot ?? "",
        TODO_TEST_CREDENTIAL: fakeValues[0],
        TODO_TEST_TITLE: fakeValues[1],
        TODO_TEST_STORAGE_ERROR: fakeValues[2],
      },
    },
  );
  const output = `${child.stdout ?? ""}${child.stderr ?? ""}`;

  assert.equal(child.status, 0);
  for (const value of fakeValues) {
    assert.equal(output.includes(value), false);
  }
});
