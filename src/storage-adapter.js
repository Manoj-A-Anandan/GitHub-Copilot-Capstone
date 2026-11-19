export const STORAGE_KEY = "tasks";

export class LocalStorageAdapter {
  constructor(storage) {
    this.storage = storage;
  }

  read() {
    let value;
    try {
      value = this.storage.getItem(STORAGE_KEY);
    } catch {
      return { kind: "unreadable", records: [], skipped: false };
    }
    if (value === null) {
      return { kind: "readable", records: [], skipped: false };
    }
    if (typeof value !== "string" || value.trim().length === 0) {
      return { kind: "unreadable", records: [], skipped: false };
    }
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch {
      return { kind: "unreadable", records: [], skipped: false };
    }
    if (!Array.isArray(parsed)) {
      return { kind: "unreadable", records: [], skipped: false };
    }

    const records = [];
    const ids = new Set();
    let skipped = false;
    for (const candidate of parsed) {
      if (!candidate || typeof candidate !== "object") {
        skipped = true;
        continue;
      }
      if (
        typeof candidate.id !== "string" ||
        candidate.id.length === 0 ||
        typeof candidate.title !== "string" ||
        candidate.status !== "incomplete" ||
        candidate.title.trim().length === 0 ||
        Array.from(candidate.title).length > 255
      ) {
        skipped = true;
        continue;
      }
      if (ids.has(candidate.id)) {
        skipped = true;
        continue;
      }
      ids.add(candidate.id);
      records.push({ id: candidate.id, title: candidate.title, status: "incomplete" });
    }
    return { kind: "readable", records, skipped };
  }

  write(records) {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(records));
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
