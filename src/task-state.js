import { validateTitle } from "./title-validator.js";

export class InMemoryTaskState {
  constructor(records = []) {
    this.snapshot = [];
    if (Array.isArray(records) && records.length > 0) {
      this.commit(records);
    }
  }

  commit(records) {
    if (!Array.isArray(records)) return false;
    const result = [];
    const ids = new Set();
    for (const record of records) {
      if (!record || typeof record !== "object") continue;
      if (typeof record.id !== "string" || record.id.length === 0) continue;
      if (typeof record.title !== "string") continue;
      const validation = validateTitle(record.title);
      if (!validation.valid || record.status !== "incomplete") continue;
      if (ids.has(record.id)) continue;
      ids.add(record.id);
      result.push({ id: record.id, title: record.title, status: "incomplete" });
    }
    this.snapshot = result;
    return true;
  }

  snapshotCopy() {
    return this.snapshot.map((record) => ({ ...record }));
  }

  createCandidate(title, id) {
    const validation = validateTitle(title);
    if (!validation.valid) return null;
    if (typeof id !== "string" || id.length === 0) return null;
    if (this.snapshot.some((record) => record.id === id)) return null;
    return { id, title, status: "incomplete" };
  }
}
