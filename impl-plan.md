# Implementation Plan: TODO Task Creation

## Section 1: Status and Approval

- **Plan status:** Human-approved on 2026-11-10. The user explicitly approved the in-repository target-scope change on 2026-11-10.
- **Implementation status:** IP-01 through IP-04 complete; IP-05 is partially complete with performance, browser-family, and physical-device verification gaps recorded below.
- **Requirements status:** Approved on 2026-11-10; DR-01 through DR-04 are incorporated and resolved.
- **Architecture status:** Approved on 2026-11-10.
- **Design review status:** DR-01 through DR-04 resolved. DR-05 and DR-06 are recommendations, not required changes.
- **Approval and authorization:** The plan remains approved on 2026-11-10. The user's scope decision explicitly authorizes creating the TODO application only in this current repository; it does not authorize work in a separate repository.
- **Target access gate:** Satisfied. The current repository is the authorized target. External-repository access is not a prerequisite.

## Section 2: Sources and Planning Constraints

- Approved requirements: `requirements.md`, including FR-12 and AC-11 for the approved stored-task-shape clarification.
- Approved architecture: `architecture.md`, including schema validation, retained corruption status, blocked creation, inline error, and unchanged raw storage for invalid stored data.
- Design review and dispositions: `design-review.md`.
- Source story: `user-story-create-todo-task.md`, Sections 1-7 and Scenarios 1-5.
- **Workspace evidence:** the repository contains the standalone `todo-app/` with `index.html`, `styles.css`, `app.js`, `server.js`, `package.json`, and `tests/app.test.js`; the root README documents its launch and test commands. The root README's statement that the repository has no application test suite predates this separate TODO app suite.
- **Implementation environment:** Node.js v24.22.0, npm v11.19.1, the built-in `node:test` runner, and `jsdom` v26.1.0 are used by the standalone app. Headless Chrome 156 and Edge 156 were exercised through their DevTools Protocol; Safari, Firefox, and physical mobile devices were not tested. No dedicated browser automation dependency is installed.
- The standalone app is implemented under `todo-app/`. JavaScript, browser LocalStorage, and standard CSS are dictated by the approved architecture; the concrete file layout, Node test runner, and `jsdom` test dependency are implementation-level choices, not approved architecture decisions.
- No requirements, architecture decisions, design-review dispositions, or production code are changed by this plan.

## Section 3: Dependency-Ordered Tasks

### IP-01: Establish the Standalone TODO App and Focused Test Setup

- **Status:** Complete on 2026-11-10.

- **Scope:** Create a small standalone app under the proposed `todo-app/` path and confirm locally available runtime/tooling. Implementation proposal: plain JavaScript ES modules, static HTML/CSS, and focused tests using Node's built-in test runner with a DOM test environment such as `jsdom`; avoid a framework, backend, and build step unless repository/environment evidence requires otherwise. This proposal is not dictated by the approved architecture. Keep the four approved logical responsibilities without forcing a one-file-per-component layout.
- **Dependencies:** None.
- **Blockers:** None. Local tooling is established as Node.js v24.22.0, npm v11.19.1, `node:test`, and `jsdom` v26.1.0; these are implementation choices, not approved architecture decisions.
- **Requirement links:** Not Found; this is an implementation foundation rather than a product behavior.
- **Architecture components:** Browser interface; task creation and validation; in-memory task state; LocalStorage boundary.
- **Expected modules:** Implemented: `todo-app/index.html`, `todo-app/styles.css`, `todo-app/app.js`, `todo-app/server.js`, `todo-app/package.json`, and `todo-app/tests/app.test.js`. These paths and test tooling are implementation-level choices, not approved architectural decisions.
- **Tests:** `npm test --prefix todo-app` runs the focused suite using `node:test` and `jsdom`, exercising DOM interactions and injected storage outcomes.
- **Acceptance criteria:** The app can be opened/run using a documented local command or direct browser entry point; a focused test command is documented and runnable; proposed files are confined to `todo-app/`; no backend or unrelated workflow artifacts are added.
- **Implementation-level tooling selected:** Node.js v24.22.0, npm v11.19.1, the built-in `node:test` runner, and `jsdom` v26.1.0. This selection implements the plan's test setup proposal and does not change the approved architecture.
- **Evidence:** `todo-app/README.md` documents the local HTTP launch command and test command. `todo-app/server.js` serves the page and its ES-module/CSS assets from an allowlist on localhost. `npm install --prefix todo-app` completed with 39 packages added and 0 reported vulnerabilities. `npm test --prefix todo-app` passed (1 test, 0 failures) at initial setup; after resolving the launch-path review finding, it passed (15 tests, 0 failures), including an HTTP test confirming the page/module assets are served and non-app files are not. The isolated HTTP test passed (1 test, 0 failures). A live `npm start --prefix todo-app` run selected port 60841 because default port 4173 was unavailable; `GET /` and `GET /app.js` both returned 200, with the module served as `text/javascript; charset=utf-8`.

### IP-02: Implement Task Loading and Persistence Failure Handling

- **Status:** Complete on 2026-11-10.

- **Scope:** Implement task loading and LocalStorage persistence in the proposed app. Persist before reporting successful creation; load persisted tasks after refresh; block creation on unavailable/full storage, write failure, malformed JSON, or structurally invalid stored data. Validate that parsed stored data is an array and that each entry has a string `title` and boolean `completed`. Malformed JSON or an invalid root/entry returns `[]` while retaining a detectable corruption-state signal. Show an inline error, preserve the title input after a blocked create attempt, and never overwrite the raw stored value when corruption is detected. Do not invent recovery behavior or restrictions on additional fields.
- **Dependencies:** IP-01.
- **Blockers:** The exact storage key and handling of missing or otherwise unreadable data remain **Not Found**; keep these outside the implementation unless a separate approved decision is provided. They do not block the specified behavior. The required stored-data shape is defined by FR-12.
- **Requirement links:** FR-03, FR-07, FR-08, FR-09, FR-11, FR-12, NFR-04, NFR-05; AC-05, AC-07, AC-08, AC-11.
- **Architecture components:** LocalStorage boundary; in-memory task state.
- **Expected modules:** Proposed `todo-app/app.js` or a small extracted storage module under `todo-app/`; exact module layout is an implementation proposal.
- **Tests:** Focused automated tests for successful load/write, malformed JSON fallback plus retained detection, storage unavailable, quota/full simulation, write failure, and refresh persistence where the test environment supports reload. Validate a non-array root and invalid entries, including `[null]`, a missing or non-string `title`, and a non-boolean `completed`. For each corrupted-data case, test safe `[]` reads, retained corruption detection, inline error, blocked creation, preserved input, and unchanged raw stored value. Use injected/fake storage for deterministic failures; test tooling is subject to IP-01's local feasibility check.
- **Acceptance criteria:** A successful write makes the task available after reload. Each specified storage failure blocks creation. Malformed JSON and structurally invalid data (invalid root or any entry missing a string `title` or boolean `completed`) read as `[]`, remain detected, show an inline error, and block creation without modifying the raw stored value; a blocked create attempt preserves the input. Focused tests pass and demonstrate each case. Recovery and requirements for additional fields remain **Not Found**.
- **Evidence:** `todo-app/app.js` exposes an injectable storage boundary, loads task state at module startup, and reports write success only after `setItem` succeeds. Malformed JSON and structurally invalid JSON return `[]` with retained `malformed` or `corrupted` status and are never overwritten. The stored shape is checked as an array of records with string `title` and boolean `completed`; additional fields are not restricted. The follow-up test matrix covers malformed JSON, an object root, `[null]`, missing/non-string `title`, and non-boolean `completed`, asserting `[]`, detectable status, blocked save, no `setItem`, and unchanged raw value. `npm test --prefix todo-app` passed (16 tests, 0 failures) after this follow-up.
- **Clarification coverage status:** The focused tests now cover the required invalid root/entry cases and assert safe `[]` reads, retained corruption detection, blocked save/create, inline error, preserved input, no `setItem`, and unchanged raw storage. See IP-03 and IP-05 for UI and acceptance evidence.

### IP-03: Implement Title Validation and the Create-Task Interaction

- **Status:** Complete on 2026-11-10.

- **Scope:** Provide the title input and **Add Task** action; reject empty/whitespace-only titles; trim valid titles; create tasks with incomplete status only after persistence succeeds; update the list and clear the input only on success. On storage failure or while corrupted stored data remains detected, block creation, preserve input, and show an inline error; do not overwrite corrupted raw storage. Keep exact message text and duration unspecified.
**Acceptance criteria:** Valid input is trimmed and appears once with incomplete status only after storage succeeds; then the field clears. Invalid input creates nothing and displays validation feedback. Storage failure creates nothing, preserves the entered title, and displays inline error feedback. Tests assert required behavior without pinning unspecified message copy/duration.
- **Evidence:** `todo-app/index.html` provides a labeled title input and native submit button; `todo-app/app.js` handles form submission, validates and trims titles, writes before updating the rendered list, clears only after a successful write, preserves the input on failures, and renders titles using `textContent`. Malformed startup data renders an empty list with inline feedback and remains blocked by the IP-02 storage boundary. `npm test --prefix todo-app` passed (14 tests, 0 failures), covering create/incomplete state, trimming, invalid titles, success-only clearing, write failure, inline errors, accessible form submission, and text rendering. Browser/device and performance validation have not been performed.
- **Dependencies:** IP-01 and IP-02.
- **Blockers:** Exact validation/error wording and duration, title length/character limits, and objective criteria for NFR-01 remain **Not Found**. They are not invented as implementation rules or release gates.
- **Requirement links:** FR-01 through FR-07, FR-10 through FR-12; NFR-02, NFR-06; AC-01 through AC-04, AC-06 through AC-08, AC-10, AC-11.
- **Architecture components:** Browser interface; task creation and validation; in-memory task state; LocalStorage boundary.
- **Expected modules:** Proposed `todo-app/index.html`, `todo-app/styles.css`, and `todo-app/app.js`; exact division of responsibilities is an implementation proposal. Render the entered title as text, consistent with the architecture recommendation.
- **Tests:** Focused tests for successful creation and incomplete status, empty and whitespace-only rejection, trimming, successful-only input clearing, storage-failure input preservation and inline error, and keyboard submission. Also test creation attempts while structurally invalid stored data is detected: no task is created, inline error is shown, input is retained, and raw stored data is unchanged. Exercise click/touch in browser acceptance checks.
- **Acceptance criteria:** Valid input is trimmed and appears once with incomplete status only after storage succeeds; then the field clears. Invalid input creates nothing and displays validation feedback. Storage failure or detected corrupted data creates nothing, preserves the entered title, and displays inline error feedback; corrupted raw storage is not overwritten. Tests assert required behavior without pinning unspecified message copy/duration.
- **Clarification coverage status:** The follow-up test matrix now also exercises structurally invalid root/entry data through form submission. It asserts an empty rendered task state, inline error, blocked creation, preserved input, and no storage write while the corrupt raw value remains unchanged; `npm test --prefix todo-app` passed (16 tests, 0 failures).

### IP-04: Verify Responsive Layout and Supported Input Modes

- **Status:** Complete on 2026-11-10 with browser-family and physical-device coverage gaps recorded below.
- **Scope:** Verify the app against the approved modern evergreen desktop/mobile Chrome, Safari, Firefox, and Edge target, using standard CSS and LocalStorage. Verify no horizontal overflow at tested mobile viewports and task creation through keyboard navigation and touch/click.
- **Dependencies:** IP-01 and IP-03.
- **Blockers:** Exact browser version cutoffs and mobile viewport dimensions are **Not Found**. Preserve the approved browser-family support statement; report actual versions/dimensions used as test conditions, not as approved product cutoffs.
- **Requirement links:** NFR-03, NFR-06; AC-09, AC-10.
- **Architecture components:** Browser interface; task creation and validation.
- **Expected modules:** Proposed `todo-app/` UI files from IP-01/IP-03. Browser checks use Chrome and Edge DevTools Protocol; no dedicated browser automation dependency is present.
- **Tests:** Exercise keyboard and touch/click task creation and inspect horizontal overflow at recorded mobile viewports. Cover all approved browser families where available; do not claim untested families passed. Safari, Firefox, and physical mobile-device checks remain unavailable/unperformed and must be reported as gaps.
- **Evidence:** Using Node.js v24.22.0 and each browser's built-in DevTools Protocol, tested headless Google Chrome 156.0.8078.80 and Microsoft Edge 156.0.4314.58 at 320x640, 375x812, 768x1024, and 1280x800. In both browsers, document and body scroll widths did not exceed the viewport client width at any tested size. At 375x812, Enter-key form submission created and persisted a task in both browsers; Chrome mouse click and Edge touch emulation also created and persisted tasks, cleared the input, and rendered a 500-character title without horizontal overflow. `npm test --prefix todo-app` passed (14 tests, 0 failures). Firefox was not found in PATH or checked common install locations; Safari was unavailable on this Windows environment. Neither family was tested. No physical mobile device was available; Edge touch input was emulated. No browser automation dependency was added.
- **Acceptance criteria:** Report actual browser versions and viewport dimensions for each executed check. The page has no horizontal overflow in each tested mobile viewport, and task creation works through keyboard and touch/click. Explicitly list untested browser families or unavailable device checks.

### IP-05: Verify Performance Targets and End-to-End Acceptance

- **Status:** Partially complete on 2026-11-10; automated and server-route checks passed and code review is APPROVED. Performance targets and the remaining browser/device coverage are unverified as recorded below.

- **Scope:** Run focused tests and end-to-end checks for AC-01 through AC-11. For AC-11, cover malformed JSON and structurally invalid data, including `[null]`, a non-array root, missing/non-string `title`, and non-boolean `completed`; verify safe `[]` reads, retained corruption status, inline error, blocked creation, preserved input, and unchanged raw storage. Measure UI-update and LocalStorage-write durations against the approved under-100-ms targets only with a defined, reproducible protocol; report actual results and gaps without implying publication approval.
- **Dependencies:** IP-02, IP-03, and IP-04.
- **Blockers:** The performance benchmarking environment and measurement method are **Not Found**. Objective verification of NFR-02 is blocked until that protocol is specified; do not choose or imply an approved one in this plan. NFR-01's objective usability criteria remain **Not Found** and are not a release gate unless separately decided.
- **Requirement links:** FR-01 through FR-12, NFR-01 through NFR-06; AC-01 through AC-11.
- **Architecture components:** Browser interface; task creation and validation; in-memory task state; LocalStorage boundary.
- **Expected modules:** `todo-app/` app and focused tests using the established Node.js/npm test setup.
- **Tests:** Run the documented focused test command and execute functional acceptance checks. Include AC-11 cases for malformed JSON, wrong root type, `[null]`, missing/non-string title, and non-boolean completed; verify the corrupted-data behavior and that raw stored data is unchanged after a blocked create attempt. Record actual browser versions, viewport conditions, and any measured durations with the chosen environment/method once specified. If no protocol is approved, report NFR-02 as not verified.
- **Acceptance criteria:** Provide pass/fail evidence for every executed AC-01 through AC-11 check, exact validation commands/results, browser and viewport test conditions, and measured durations with environment/method if authorized. Mark unverified criteria explicitly; do not fabricate outcomes.
- **Evidence:** `npm test --prefix todo-app` passed (16 tests, 0 failures). The current `npm start --prefix todo-app` server route smoke checks returned 200 for `/`, `/app.js`, and `/styles.css`, and 404 for `/package.json` and encoded traversal. `git diff --check` passed. `npm audit --prefix todo-app` could not complete because npm registry DNS resolution failed (`EAI_AGAIN`). Code review result: **APPROVED**; this is a review result, not human approval to publish. Chrome 156 and Edge 156 responsive/input checks are recorded under IP-04; Firefox, Safari, and physical mobile checks remain unverified, and no dedicated browser automation dependency was used. Performance targets remain unverified because the measurement protocol is **Not Found**. NFR-01 usability evaluation criteria also remain **Not Found** and are not a release gate unless separately decided. No repository files changed during Verification.
- **Clarification coverage status:** AC-11's required invalid root/entry cases are now covered by the focused automated tests, including malformed JSON, object root, `[null]`, missing/non-string `title`, and non-boolean `completed`. Tests assert safe `[]` reads, detectable corruption status, blocked save/create, inline error, preserved input, zero `setItem` calls, and unchanged raw storage. `npm test --prefix todo-app` passed (16 tests, 0 failures). This records automated evidence only and does not change the browser-family or performance verification gaps above.

## Section 4: Cross-Task Traceability

- **FR-01 through FR-07, FR-10:** IP-03.
- **FR-08, FR-09:** IP-02.
- **FR-12:** IP-02 implements and validates the stored-array/entry shape and corruption signal; IP-03 uses that signal to block creation and preserve/show the required UI state; IP-05 verifies AC-11 end to end.
- **FR-03, FR-07, FR-11:** IP-02 and IP-03.
- **NFR-01:** IP-05 records the unresolved objective criteria; no new usability gate is defined.
- **NFR-02:** IP-03 and IP-05; the under-100-ms targets are approved, while benchmark environment/method are **Not Found** and block objective performance verification.
- **NFR-03:** IP-04; browser families/outcome are approved, while exact versions/viewports are **Not Found**.
- **NFR-04, NFR-05:** IP-02.
- **NFR-06:** IP-03 and IP-04.
- **AC-01 through AC-08:** IP-02 and IP-03 as mapped in their task entries.
- **AC-11:** IP-02, IP-03, and IP-05; schema-validation cases and UI creation-blocking behavior are now covered by focused automated tests (16 passed, 0 failed), including unchanged raw storage and preserved input. Browser-specific AC-11 execution was not performed.
- **AC-09:** IP-04.
- **AC-10:** IP-03, IP-04, and IP-05; performance measurement remains blocked on the unspecified protocol.

## Section 5: Preserved Unknowns and Exclusions

- Exact validation and storage-error wording and presentation duration: **Not Found**.
- Title length/character restrictions: **Not Found**.
- Exact mobile viewport dimensions and browser version cutoffs: **Not Found**. Record actual test conditions without treating them as approved cutoffs. Chrome 156 and Edge 156 were exercised via DevTools Protocol; Safari, Firefox, and physical mobile were not tested, and no dedicated browser automation dependency is present.
- Performance benchmarking environment and measurement method: **Not Found**.
- Recovery after malformed or structurally invalid stored data beyond reads defaulting to `[]` and creation being blocked while corrupted state remains detected: **Not Found**. No recovery task is included.
- Handling of storage data that is missing or unreadable for reasons other than malformed JSON: **Not Found**.
- Objective evaluation criteria for “simple and user-friendly” and whether it is a release gate: **Not Found**.
- Local tooling is established as Node.js v24.22.0, npm v11.19.1, built-in `node:test`, and `jsdom` v26.1.0. These implementation-level choices do not alter approved architecture.
- Editing, deleting, or completing tasks; due dates/reminders; authentication; backend/database integration: out of scope per requirements.

## Section 6: Plan Gate

This plan remains human-approved on 2026-11-10. The user explicitly authorized implementing the TODO application only in this current repository on 2026-11-10; the former external-repository access prerequisite is removed. IP-01 through IP-04 are complete, and IP-05 is partially complete: the 16-test suite, current server route smoke checks, and APPROVED code review are recorded above. Chrome 156 and Edge 156 were exercised via DevTools Protocol; Safari, Firefox, and physical-device coverage remain unverified, with no dedicated browser automation dependency. Performance verification remains blocked by the **Not Found** measurement protocol. These gaps do not change the in-repository target scope or plan approval. Approval and authorization do not resolve any preserved **Not Found** item or authorize changing approved requirements or architecture. Per the Implementation Planning Agent gate, downstream implementation should proceed only against this approved plan and its scoped authorization.