const DEFAULT_DOM_IDS = ["title", "add-task", "task-list", "feedback"];

/** Returns fresh deterministic task records for each test. */
export function deterministicRecords() {
  return [
    { id: "fixture-1", title: "First fixture task", status: "incomplete" },
    { id: "fixture-2", title: "Second fixture task", status: "incomplete" },
  ];
}

/** Returns storage setups for the supported read-result categories. */
export const storageValues = Object.freeze({
  absent: Object.freeze({ value: null }),
  malformed: Object.freeze({ value: "{" }),
  readable: Object.freeze({ value: '[{"id":"fixture-1"}]' }),
  unreadable: Object.freeze({
    value: null,
    getItemError: new Error("injected read failure"),
  }),
});

/** Creates an isolated, minimal DOM surface for unit tests. */
export function createDomFixture() {
  const elements = new Map();
  const document = {
    createElement: (tagName) => new FixtureElement(tagName),
    getElementById: (id) => elements.get(id) ?? null,
  };

  function initializeElements() {
    elements.clear();
    for (const id of DEFAULT_DOM_IDS) {
      const element = new FixtureElement(id === "title" ? "input" : "div");
      element.id = id;
      element.ownerDocument = document;
      elements.set(id, element);
    }
  }

  initializeElements();

  return {
    document,
    getElementById: document.getElementById,
    reset() {
      initializeElements();
    },
  };
}

/** Creates isolated local-storage behavior and observable method calls. */
export function createStorageFixture(configuration = {}) {
  let state = { ...configuration };
  let values = new Map();
  let getItemCalls = [];
  let setItemCalls = [];

  function initialize(nextConfiguration) {
    state = { ...nextConfiguration };
    values = new Map();
    if (state.value !== null && state.value !== undefined) {
      values.set("tasks", String(state.value));
    }
    getItemCalls = [];
    setItemCalls = [];
  }

  initialize(state);

  const storage = {
    getItem(key) {
      getItemCalls.push(key);
      if (state.getItemError) {
        throw state.getItemError;
      }
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      const observedValue = String(value);
      setItemCalls.push({ key, value: observedValue });
      if (state.setItemError) {
        throw state.setItemError;
      }
      values.set(key, observedValue);
    },
  };

  return {
    storage,
    observations: {
      get getItemCalls() {
        return [...getItemCalls];
      },
      get setItemCalls() {
        return setItemCalls.map((call) => ({ ...call }));
      },
    },
    reset(nextConfiguration = {}) {
      initialize(nextConfiguration);
    },
  };
}

class FixtureElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.id = "";
    this.value = "";
    this.textContent = "";
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = [...children];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) ?? []) {
      listener.call(this, event);
    }
    return true;
  }
}
