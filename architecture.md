# Architecture

## Overview

This document defines the architecture for the approved local, single-user TODO application. It describes logical responsibilities, not the current implementation; implementation structure and target repository details are **Not Found**.

The application runs in a browser using JavaScript and browser LocalStorage, without a backend or external database (FR-08, FR-09, NFR-04; Story Section 7). A valid title is trimmed at both edges, persisted before successful creation is reflected in the UI, and creates a task with incomplete status. Empty or whitespace-only titles are rejected. Stored task data is valid only when it is a JSON array of records with a string `title` and boolean `completed`. Malformed JSON or a parsed value with an invalid root or entry shape is corrupted: reads safely default to an empty list (`[]`), the corruption status is exposed with an inline error, creation is blocked, failed creation preserves the input, and raw storage is not overwritten. Storage unavailable/full and write failure also block creation, show an inline error, and preserve the input (FR-03–FR-12; approved DR-01 and DR-02; approved clarification dated 2026-11-10). The target is modern evergreen desktop and mobile Chrome, Safari, Firefox, and Edge, with responsive mobile layouts that do not require horizontal scrolling (NFR-03; approved DR-03). UI updates and LocalStorage writes each complete in under 100 ms, and task creation is operable by keyboard navigation and touch/click (NFR-02; approved DR-04, NFR-06).

The browser version cutoffs, viewport dimensions, exact error wording and duration, performance measurement environment, storage key, missing or otherwise unreadable storage behavior, and corrupted-data recovery beyond the specified `[]` read fallback are **Not Found**.

## Architecture Diagram

```mermaid
flowchart LR
    User[User]
    View[Browser interface]
    Creation[Task creation and validation]
    State[In-memory task state]
    Storage[Browser LocalStorage]

    User -->|Keyboard or touch/click| View
    View -->|Title and Add Task| Creation
    Creation -->|Reject invalid title / show validation| View
    Creation -->|Read stored tasks| Storage
    Storage -->|Valid data or corrupted-data fallback [] + status| State
    Creation -->|Storage failure or corruption: block / inline error| View
    Creation -->|Trimmed title; write succeeds| Storage
    Storage -->|Write succeeds| State
    State -->|Show incomplete task; clear input| View
    Storage -->|Load on startup or refresh| State
```

The boxes are logical responsibilities, not claims about existing files, modules, or deployment structure. Corrupted data means malformed JSON or a root/entry shape that does not match the approved stored-task shape; the status must remain available to the creation flow so it can block writes and to the interface so it can show the inline error. The flow traces to FR-01–FR-12, NFR-02, NFR-03, NFR-05, and NFR-06; approved clarification dated 2026-11-10.

## Components

**Logical components:**

- Browser interface for the title input, **Add Task** action, task list, validation and inline storage errors; it supports keyboard navigation and touch/click and avoids horizontal scrolling at mobile viewports (FR-01, FR-02, FR-05, FR-10, FR-11; NFR-03, NFR-06).
- Task creation and validation for rejecting empty/whitespace-only titles, trimming valid title edges, and producing incomplete tasks only after persistence succeeds (FR-03, FR-04, FR-06, FR-11; approved DR-01 and DR-02).
- In-memory task state for the collection presented by the interface; malformed JSON and structurally invalid JSON reads safely default to `[]` while exposing corruption status (FR-05, FR-12; approved clarification dated 2026-11-10).
- LocalStorage boundary for loading and persisting tasks across refreshes and reporting unavailable, full, or failed writes to the creation flow (FR-08, FR-09, FR-11; NFR-04, NFR-05).

The exact code organization and interfaces are **Not Found**. These responsibilities are architecture-level boundaries, not a prescribed module layout.

## Component Responsibilities

| Component | Responsibility | Traceability |
|---|---|---|
| Browser interface | Accept title submission through keyboard navigation or touch/click; display tasks, validation messages, and inline storage/corruption errors; clear input only after success and retain it on failed creation. Support responsive mobile layouts without horizontal scrolling. | FR-01, FR-02, FR-05, FR-07, FR-10–FR-12; NFR-03, NFR-06; approved clarification dated 2026-11-10 |
| Task creation and validation | Reject empty/whitespace-only titles; trim leading/trailing whitespace from valid titles; block creation while a storage failure or corrupted-data status is present; create an incomplete task only after the storage write succeeds. | FR-03, FR-04, FR-06, FR-11, FR-12; approved DR-01 and DR-02; approved clarification dated 2026-11-10 |
| In-memory task state | Keep loaded and successfully created tasks available to the interface; represent malformed JSON or invalid root/entry shape as an empty list (`[]`) and expose corruption status without authorizing creation while corrupted storage remains detected. | FR-05, FR-12; NFR-02; approved clarification dated 2026-11-10 |
| LocalStorage boundary | Load persisted tasks, validate the approved JSON shape, attempt writes, and report unavailable/full/write-failure and corrupted-data conditions to the creation flow. Do not overwrite raw storage on detection of corrupted data. | FR-08, FR-09, FR-11, FR-12; NFR-04, NFR-05; approved clarification dated 2026-11-10 |

## Data Flow

1. The user enters a title and activates **Add Task** using keyboard navigation or touch/click (FR-01–FR-03; NFR-06).
2. Empty or whitespace-only input is rejected with a validation message. Exact wording and duration are **Not Found** (FR-04, FR-10).
3. For valid input, trim leading and trailing whitespace. Read and validate stored data against the approved shape: a JSON array of records, each with a string `title` and boolean `completed`. If parsing fails or the root/any entry does not match that shape, default the read result to `[]`, expose corruption status, and block task creation while that state remains detected. Show an inline error, preserve the input after the failed create attempt, and leave the raw stored value unchanged. Do not infer repair or recovery beyond this fallback (FR-03, FR-11, FR-12; approved DR-01 and DR-02; approved clarification dated 2026-11-10).
4. If LocalStorage is unavailable or full, or the write fails, do not create the task, show an inline error, and retain the entered title. Exact error wording and duration are **Not Found** (FR-07, FR-11; approved DR-01).
5. Only after the write succeeds, reflect the incomplete task in the list and clear the input. UI updates and storage writes each complete in under 100 ms (FR-03, FR-05–FR-08; NFR-02).
6. On startup after refresh, read and display persisted tasks (FR-09, NFR-05). Malformed JSON or a structurally invalid parsed value reads as `[]`, with corruption status exposed and an inline error shown; the raw stored value is not overwritten. Further recovery is **Not Found** (FR-12; approved clarification dated 2026-11-10).

The persisted task shape is a JSON array of records, each with a string `title` and boolean `completed` (FR-12; approved clarification dated 2026-11-10). The storage key, identifier strategy, and any additional serialized fields or format details are **Not Found**.

## Technology Choices

**Approved choices:** JavaScript in a browser and browser LocalStorage; no backend or external database (FR-08, FR-09, NFR-04; Story Section 7). Support modern evergreen desktop and mobile Chrome, Safari, Firefox, and Edge using standard CSS and LocalStorage; mobile layouts must not require horizontal scrolling (NFR-03; approved DR-03). UI updates and LocalStorage writes each have a completion target under 100 ms, and task creation supports keyboard navigation and touch/click (NFR-02, NFR-06; approved DR-04).

**Recommendations:** Keep LocalStorage access behind a small boundary to handle persistence outcomes consistently, and render user-provided titles as text. These are recommendations, not additional user-approved requirements or technology selections.

**Not Found:** UI framework, build tooling, package manager, storage key, test framework, deployment/hosting approach, exact browser version cutoffs, performance measurement environment and method, and target repository conventions. The approved JSON data shape is defined in FR-12; additional storage fields or schema/versioning policy are **Not Found**. No framework or tool is selected here.

## API / Integration Boundaries

There is no required server API or external service; the story explicitly says no backend or external database (Story Section 7). The browser interface communicates with task-creation/state responsibilities, and task persistence crosses only the browser LocalStorage boundary (FR-08, FR-09).

The storage boundary must block creation, show an inline error, and preserve the input when storage is unavailable/full or a task write fails. Malformed JSON and structurally invalid parsed data read as `[]`, expose corruption status, block creation while that corrupted state remains detected, and leave raw storage unchanged (FR-11, FR-12; approved DR-01; approved clarification dated 2026-11-10). The valid stored shape is a JSON array of records with a string `title` and boolean `completed`. Any recovery beyond this read fallback is **Not Found**. The exact browser storage key, additional serialized fields or format details, migration/versioning policy, and handling of missing or unreadable data for reasons other than malformed or structurally invalid JSON are **Not Found**. No network integration is specified.

## Security

**Requirements-derived constraints:** The app is local and single-user, and no authentication or server-side database is in scope (Story Sections 6–7). Task data is stored locally in the browser (FR-08, NFR-04).

**Recommendations:** Render task titles as text rather than interpreting them as markup. Treat local storage as untrusted input when reading it, and avoid storing secrets there. Consider that browser storage is accessible to scripts executing in the same origin and can be cleared or modified by the user. These are security recommendations, not additional product requirements.

Authentication, authorization, encryption at rest, privacy/retention policy, and any security-specific acceptance criteria are **Not Found**. The requested repository was not inspected, so repository-specific security controls are **Not Found**.

## Scalability

The approved scope is a local, single-user browser application without a backend, so multi-user or server-side horizontal scaling is not part of this architecture (Story Section 7; out-of-scope requirements). A local-storage-backed collection is bounded by browser storage capacity; task-count targets and performance thresholds are **Not Found** (FR-08, NFR-02).

**Recommendation:** Keep storage and rendering responsibilities separable so a future, explicitly approved change could replace or extend local persistence. No such backend or synchronization is proposed now.

## Reliability

Successful tasks must remain available after a normal browser refresh (FR-09, NFR-05). Storage unavailable/full, a failed task write, malformed JSON, or a parsed value with invalid root/entry shape blocks task creation; the UI shows an inline error and preserves the input after a failed create attempt (FR-07, FR-11, FR-12; approved DR-01; approved clarification dated 2026-11-10). Malformed or structurally invalid data safely reads as `[]`, exposes corruption status, and does not permit creation while corruption remains detected. The raw stored value must not be overwritten. No additional recovery, repair, retry, or unsaved in-memory creation behavior is specified; recovery beyond the read fallback is **Not Found**.

The exact inline error wording/duration, performance measurement environment, and what constitutes a normal refresh are **Not Found**. Persistence after browser data clearing, profile changes, or device loss is not established by the requirements. UI updates and storage writes each have a target below 100 ms (NFR-02); how to measure that target is **Not Found**.

## Architecture Decisions

**Approval status:** The decisions in this table are approved by the user on 2026-11-10. They are derived from the approved requirements; this record does not approve any recommendation below.

**Approved clarification (2026-11-10):** FR-12 clarifies the stored task shape and behavior for structurally invalid data, supplementing the existing storage-corruption behavior without changing the existing architecture decisions. This is an approved requirements clarification, not a new numbered architecture decision or design-review finding.

| ID | Approved decision | Basis | Approval status |
|---|---|---|---|
| AD-01 | Use a client-only browser architecture with JavaScript and browser LocalStorage; do not introduce a backend or external database. | FR-08, FR-09, NFR-04; Story Section 7 | Approved by user on 2026-11-10 |
| AD-02 | Use logical interface, task validation/creation, in-memory state, and LocalStorage boundaries; exact code organization remains implementation-specific. | FR-01–FR-12, NFR-02 | Approved by user on 2026-11-10 |
| AD-03 | If storage is unavailable/full or a task write fails, block creation, show an inline error, and preserve the input. Malformed JSON reads safely default to `[]` and block creation while malformed storage remains detected; no further recovery is specified. | FR-07, FR-11, FR-12 | Approved by user on 2026-11-10 |
| AD-04 | Trim leading and trailing whitespace from valid titles; reject empty and whitespace-only titles. | FR-03, FR-04, FR-10 | Approved by user on 2026-11-10 |
| AD-05 | Support modern evergreen desktop and mobile Chrome, Safari, Firefox, and Edge with responsive layouts that do not require horizontal scrolling at mobile viewports. | NFR-03 | Approved by user on 2026-11-10 |
| AD-06 | UI updates and LocalStorage writes each complete in under 100 ms; task creation is operable through keyboard navigation and touch/click. | NFR-02, NFR-06 | Approved by user on 2026-11-10 |

**Recommendations, not approved decisions:** Isolate LocalStorage access behind a small boundary and render user-provided titles as text. These recommendations do not select a framework or prescribe an implementation structure.

**Open items:**

- Exact title-validation and storage-error wording, presentation duration, and message details: **Not Found** (FR-10, FR-11).
- Task-title length or character restrictions: **Not Found** (FR-03, FR-04).
- Recovery after malformed stored data beyond defaulting reads to `[]`: **Not Found** (FR-12).
- Exact mobile viewport dimensions and browser version cutoffs for "modern evergreen": **Not Found** (NFR-03).
- Performance measurement environment and method for the under-100-ms targets: **Not Found** (NFR-02).
- Evaluation criteria for a simple and user-friendly interface and other stakeholders: **Not Found** (NFR-01; requirements open questions 6-7).
- Storage key, handling of missing or otherwise unreadable data, additional stored fields, and schema/versioning policy: **Not Found** (requirements inputs and validation scenarios). The required JSON shape is defined in FR-12.

## Risks and Trade-offs

| Risk or trade-off | Impact | Traceability / status |
|---|---|---|
| Browser storage can be unavailable, full, or fail during a write. | Creation must be blocked and reported inline while retaining the input; the user cannot complete creation until storage is usable. | FR-07, FR-11; approved DR-01 |
| Persisted task data may contain malformed JSON or a structurally invalid root/entry shape. | Reads default safely to `[]`, corruption status and an inline error are exposed, creation is blocked while corruption remains detected, failed creation preserves input, and raw storage is not overwritten; recovery beyond this behavior is **Not Found**. | FR-11, FR-12; approved DR-01 and approved clarification dated 2026-11-10 |
| LocalStorage can be cleared or changed. | Refresh persistence is not a backup or cross-device guarantee; persistence after clearing or profile/device changes is **Not Found**. | FR-09, NFR-05 |
| Local-only persistence is bound to the browser profile/origin. | No cross-device synchronization or server recovery is provided; this follows the stated local-only scope. | Story Section 7; server integration out of scope |
| The exact browser version cutoffs and mobile viewport dimensions are unspecified. | Compatibility and no-horizontal-scroll behavior need concrete test targets during implementation planning. | NFR-03; details **Not Found** |
| Performance measurement environment and method are unspecified. | Results for the under-100-ms UI update and storage write targets may not be comparable without a defined measurement approach. | NFR-02; details **Not Found** |
| Exact error wording/duration and recovery after corrupted-data fallback are unspecified. | User-facing copy and behavior beyond the safe `[]` read fallback cannot be designed more specifically without new decisions. | FR-10–FR-12; details **Not Found** |
| Target repository implementation context was not inspected. | Existing patterns, dependencies, and feasibility against that target cannot be confirmed; details are **Not Found**. | Repository implementation details |