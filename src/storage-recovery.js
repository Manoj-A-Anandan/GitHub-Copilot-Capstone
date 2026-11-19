export class StorageRecoveryState {
  constructor(initialStatus = "WRITES_ALLOWED") {
    this.status = initialStatus;
  }

  enterUnreadableInitialLoad() {
    this.status = "BLOCKED_WRITES";
  }

  reread(adapter) {
    const result = adapter.read();
    if (result.kind === "unreadable") return { success: false, result };
    this.status = "WRITES_ALLOWED";
    return { success: true, result };
  }

  confirmReplacement() {
    this.status = "WRITES_ALLOWED";
    return true;
  }

  isBlocked() {
    return this.status === "BLOCKED_WRITES";
  }

  releaseToAllowed() {
    this.status = "WRITES_ALLOWED";
  }
}
