---
name: js-implementation
description: JavaScript implementation standards derived from this repository's real conventions (ES modules, node:test, injected dependencies, textContent rendering) — naming, const/let, modularity, validation, error handling, UI/business separation, and avoiding unnecessary refactoring. Use when writing, fixing, or reviewing JavaScript in src/ and tests/.
---

# JavaScript implementation

Conventions below are what `src/` already does. Match them; do not introduce a new style.

## 1. Repository facts to respect
- ES modules (`"type": "module"`), named exports, relative imports with the `.js` extension.
- Node ≥ 20, no runtime dependencies, tests via `node --test` (`node:test` + `node:assert/strict`).
- Browser app: `src/app.js` is the composition root; logic lives in small modules (`title-validator`, `task-state`, `storage-adapter`, `storage-recovery`, `task-creation-controller`, `task-list-renderer`).
- Dependencies (storage, DOM elements, id factory) are **injected** into classes, which is what makes tests hermetic.

## 2. Naming
| Kind | Style | Example |
|------|-------|---------|
| variables, functions, methods, properties | camelCase | `validateTitle`, `snapshotCopy` |
| classes | PascalCase | `TaskCreationController`, `InMemoryTaskState` |
| module-level constants (messages, limits) | UPPER_SNAKE_CASE | `REQUIRED_TITLE_MESSAGE` |
| files | kebab-case | `task-list-renderer.js` |
| booleans | `is/has/can` prefix | `isBlocked()` |
Names state intent (`candidate`, `snapshot`), not type (`data`, `obj`, `tmp`). Functions are verbs, values are nouns. No single-letter names outside tiny loops/callbacks.

## 3. Declarations and scope
- `const` by default; `let` only when reassigned; never `var`.
- No implicit or mutable globals. Module scope for constants; state lives in objects that are passed in. `globalThis`/`window` access happens at the edge (composition root) or behind an injected parameter with a safe default.
- Use strict equality; prefer `Array.from`, `Set`, spread over manual loops where clearer.

## 4. Functions and modules
- Small, one responsibility, early returns instead of deep nesting; ~20 lines is a prompt to look for a split, not a rule.
- Pure where possible (`validateTitle` returns a result object, no side effects).
- Rules and messages have a single definition; import them, never copy the string or the number (e.g. max length 255).
- Return explicit result objects for expected failures (`{ success:false, reason }`) as the codebase does; throw only for programmer errors.
- Public functions get a one-line JSDoc when intent or the result shape is not obvious.

## 5. Input validation
Validate at every boundary: user input, data read from storage, parsed JSON, function arguments from untrusted callers. Check type first, then range/length, then content. Normalise after validating. Return a specific message; never rely on a later crash to catch bad input. Count length in code points (`Array.from(s).length`) when the requirement says characters.

## 6. Error handling
- Wrap only the operation that can fail (`localStorage` access, `JSON.parse`) in `try/catch`; handle or convert it, never swallow silently.
- Convert exceptions into the documented user-facing message/result; keep the original error out of the UI.
- Do not mutate state before the side effect (write) succeeded; commit after success.
- No `console.log` of user data; no stack traces to the UI.

## 7. UI vs business logic
- DOM access, event wiring and rendering stay in `app.js` and renderer modules; rules (validation, state transitions, recovery decisions) stay DOM-free and testable in Node.
- Render user text with `textContent`/`createElement`; never `innerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, or inline handlers built from data.
- Controllers receive elements as parameters, so tests pass fakes.

## 8. Duplicate logic and refactoring discipline
- If the same rule appears twice, extract it once, in the module that owns it.
- Change only what the task requires. Do not rename, reformat, or restructure unrelated code. If you see a problem outside the task, report it, do not fix it in this change.
- No speculative options, hooks or abstractions.

## 9. Tests accompany code
Add or update a `node:test` test for each behaviour change, named with the requirement ID (see `testing-strategy`). Run `npm test` before reporting done and paste the real counts.

## 10. Before you report done
- [ ] camelCase/PascalCase/UPPER_SNAKE respected; no `var`; no new globals
- [ ] Inputs validated; failures return/handle documented messages
- [ ] No duplicated rule, no dead code, no commented-out code
- [ ] No `innerHTML`/`eval`; no secrets or `console.log` of data
- [ ] Only files in the task's scope changed (`git diff --stat`)
- [ ] `npm test` run; real output captured
