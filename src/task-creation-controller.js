import { validateTitle, REQUIRED_TITLE_MESSAGE } from "./title-validator.js";
import { renderTaskList } from "./task-list-renderer.js";

export const UNREADABLE_LOAD_MESSAGE =
  "Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.";
export const FAILED_SAVE_MESSAGE = "Unable to save the task. Please try again.";

export class TaskCreationController {
  constructor({ state, recovery, adapter, input, feedback, list, idFactory, partialFeedback }) {
    this.state = state;
    this.recovery = recovery;
    this.adapter = adapter;
    this.input = input;
    this.feedback = feedback;
    this.list = list;
    this.idFactory = idFactory ?? (() =>
      globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    this.partialFeedback = partialFeedback ?? "Some malformed saved tasks were skipped.";
  }

  submit() {
    const rawTitle = this.input?.value ?? "";
    const validation = validateTitle(rawTitle);
    if (!validation.valid) {
      this.setFeedback(validation.message);
      return { success: false, reason: "validation" };
    }
    if (this.recovery.isBlocked()) {
      this.setFeedback(UNREADABLE_LOAD_MESSAGE);
      return { success: false, reason: "blocked" };
    }
    let candidate = null;
    let id;
    for (let attempts = 0; attempts < 10 && !candidate; attempts += 1) {
      id = this.idFactory();
      candidate = this.state.createCandidate(rawTitle, id);
    }
    if (!candidate) {
      this.setFeedback(REQUIRED_TITLE_MESSAGE);
      return { success: false, reason: "validation" };
    }

    const snapshot = [...this.state.snapshotCopy(), candidate];
    const write = this.adapter.write(snapshot);
    if (!write.success) {
      this.setFeedback(FAILED_SAVE_MESSAGE);
      return { success: false, reason: "write" };
    }
    this.state.commit(snapshot);
    renderTaskList(this.list, this.state.snapshotCopy());
    if (this.input) this.input.value = "";
    this.setFeedback("");
    return { success: true, record: candidate };
  }

  setFeedback(message) {
    if (this.feedback) this.feedback.textContent = message;
  }
}
