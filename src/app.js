import { InMemoryTaskState } from "./task-state.js";
import { LocalStorageAdapter } from "./storage-adapter.js";
import { StorageRecoveryState } from "./storage-recovery.js";
import { TaskCreationController, UNREADABLE_LOAD_MESSAGE } from "./task-creation-controller.js";
import { renderTaskList } from "./task-list-renderer.js";

function resolveStorage(storageRef) {
  if (storageRef !== undefined) return storageRef;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function initializeApp(documentRef = document, storageRef) {
  const input = documentRef.getElementById("title");
  const form = documentRef.getElementById("task-form");
  const feedback = documentRef.getElementById("feedback");
  const list = documentRef.getElementById("task-list");
  const reread = documentRef.getElementById("reread-tasks");
  const replace = documentRef.getElementById("replace-tasks");
  if (!input || !form || !feedback || !list) return null;

  const adapter = new LocalStorageAdapter(resolveStorage(storageRef));
  const state = new InMemoryTaskState();
  const recovery = new StorageRecoveryState();
  const initial = adapter.read();
  if (initial.kind === "unreadable") {
    recovery.enterUnreadableInitialLoad();
    state.commit([]);
    feedback.textContent = UNREADABLE_LOAD_MESSAGE;
  } else {
    state.commit(initial.records);
    recovery.releaseToAllowed();
    feedback.textContent = initial.skipped
      ? "Some malformed saved tasks were skipped."
      : "";
  }
  renderTaskList(list, state.snapshotCopy());

  const controller = new TaskCreationController({
    state,
    recovery,
    adapter,
    input,
    feedback,
    list,
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    controller.submit();
  });

  reread?.addEventListener("click", () => {
    const rereadResult = recovery.reread(adapter);
    if (!rereadResult.success) {
      feedback.textContent = UNREADABLE_LOAD_MESSAGE;
      return;
    }
    state.commit(rereadResult.result.records);
    renderTaskList(list, state.snapshotCopy());
    feedback.textContent = rereadResult.result.skipped
      ? "Some malformed saved tasks were skipped."
      : "";
  });

  replace?.addEventListener("click", () => {
    const confirmed = typeof window.confirm === "function"
      ? window.confirm("Replace unreadable saved tasks? This can discard them.")
      : false;
    if (!confirmed) return;
    recovery.confirmReplacement();
    state.commit([]);
    renderTaskList(list, state.snapshotCopy());
    feedback.textContent = "";
  });

  return { state, recovery, adapter, controller };
}

if (typeof document !== "undefined") {
  const app = document.querySelector("#app");
  if (!app) {
    throw new Error("TODO page root is unavailable.");
  }
  initializeApp(document);
}
