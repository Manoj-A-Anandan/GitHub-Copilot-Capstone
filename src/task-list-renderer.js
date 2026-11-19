export function renderTaskList(container, snapshot) {
  if (!container || typeof container.replaceChildren !== "function") return;
  const children = [];
  for (const record of Array.isArray(snapshot) ? snapshot : []) {
    const item = container.ownerDocument?.createElement("li") ??
      { textContent: "", appendChild() {}, children: [] };
    if (typeof item.appendChild !== "function") item.appendChild = () => {};
    const title = container.ownerDocument?.createElement("span") ??
      { textContent: "", appendChild() {}, children: [] };
    const status = container.ownerDocument?.createElement("span") ??
      { textContent: "", appendChild() {}, children: [] };
    title.textContent = typeof record.title === "string" ? record.title : "";
    status.textContent = record.status === "incomplete" ? "incomplete" : "";
    if (typeof item.appendChild === "function") {
      item.appendChild(title);
      item.appendChild(status);
    }
    children.push(item);
  }
  container.replaceChildren(...children);
}
