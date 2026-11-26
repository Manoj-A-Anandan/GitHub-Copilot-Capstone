import assert from "node:assert/strict";
import test from "node:test";
import { createDomFixture } from "./fixtures/browser-fixtures.js";
import { renderTaskList } from "../src/task-list-renderer.js";

test("NFR-1 renderer uses text only and reflects the committed snapshot", () => {
  const dom = createDomFixture();
  const list = dom.getElementById("task-list");
  renderTaskList(list, [
    { id: "1", title: "<img src=x onerror=alert(1)>", status: "incomplete" },
    { id: "2", title: "<script>throw 1</script>", status: "incomplete" },
  ]);
  assert.equal(list.children.length, 2);
  assert.equal(list.children[0].children[0].textContent, "<img src=x onerror=alert(1)>");
  assert.equal(list.children[0].children[1].textContent, "incomplete");
});
