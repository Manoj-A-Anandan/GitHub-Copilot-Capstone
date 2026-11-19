# feat(todo): add persistent browser task creation

## Summary
Builds the approved browser-only TODO task creation flow with title validation, local persistence, safe rendering, and recovery from storage failures. It provides the create-and-restore behavior in the [Create a TODO Task story](../user-story-create-todo-task.md) without a backend.

## Changes Made
- `.env.example` — added — documents that the application requires no environment variables or credentials (T-03, NFR-8).
- `.github/copilot-instructions.md` — added — supplies repository workflow guidance established during preflight (Stage 0).
- `.github/instructions/code.instructions.md` — modified — aligns missing-data guidance with approved scope and DR-2's conditional `Not Found` decision.
- `.gitignore` — added — excludes local/generated artifacts from tracked source changes (Stage 0).
- `.sdlc/state.md` — added — records approved SDLC gates and human decisions (Stage 0).
- `CHANGELOG.md` — added — records user-visible task creation, persistence, and recovery behavior under `[Unreleased]` (T-23, FR-1–FR-10).
- `README.md` — added — documents local launch, usage, browser-storage recovery, configuration, and tests (T-22, NFR-4, NFR-6–NFR-8).
- `docs/architecture.md` — added — defines the browser-only flow, storage recovery, rendering, and component mappings (FR-1–FR-10, NFR-1–NFR-8).
- `docs/code-review.md` — added — records the approved review and open CR-1 finding (Stage 6).
- `docs/design-review.md` — added — records DR-1/DR-2/DR-3 decisions and Round 2 approval (Stage 3).
- `docs/impl-plan.md` — added — describes implementation tasks T-01–T-23 and their coverage/dependencies.
- `docs/requirements.md` — added — specifies approved task creation, validation, storage, and recovery behavior (FR-1–FR-10, NFR-1–NFR-8).
- `docs/traceability.md` — added — maps requirements to implementation and tests, including accepted risks and verification (FR-1–FR-10, NFR-1–NFR-8).
- `docs/verification-report.md` — added — records Stage 7 test, coverage, browser, and audit evidence.
- `docs/pr-description.md` — added — packages the changes, verification evidence, limitations, and review checklist for this PR (Stage 8).
- `package.json` — added — defines the test command and Node.js engine requirement (T-01, NFR-7).
- `src/app.js` — added — wires initial load, task creation, rendering, and storage recovery actions (T-18, FR-1–FR-10).
- `src/index.html` — added — provides the task input, Add Task action, list, feedback, and recovery controls (T-16, FR-1, FR-2).
- `src/storage-adapter.js` — added — reads, recovers, and atomically writes browser task storage (T-08, FR-8, FR-9, NFR-6).
- `src/storage-recovery.js` — added — blocks writes after unreadable initial storage until reread or confirmed replacement (T-10, DR-1, NFR-6).
- `src/styles.css` — added — styles responsive controls for the required viewport widths (T-16, NFR-4).
- `src/task-creation-controller.js` — added — validates, persists, commits, reports failures, and clears input only after successful creation (T-12, FR-3–FR-8, FR-10).
- `src/task-list-renderer.js` — added — renders titles as text and displays incomplete status (T-14, FR-5, FR-6, NFR-1).
- `src/task-state.js` — added — owns ordered task records and candidate snapshots (T-06, FR-3, FR-5, FR-6).
- `src/title-validator.js` — added — enforces required-title and 255-code-point validation (T-04, FR-4, FR-10).
- `tests/README.md` — added — describes the test layout (T-01, NFR-7).
- `tests/fixtures.test.js` — added — verifies deterministic browser and storage fixtures (T-02, NFR-6, NFR-7).
- `tests/fixtures/browser-fixtures.js` — added — supplies isolated DOM/storage fixtures and injected storage faults (T-02, NFR-6, NFR-7).
- `tests/integrated-flow.test.js` — added — covers integrated task creation, feedback, persistence, and restoration (T-19, FR-1–FR-10).
- `tests/p2-browser-acceptance.test.js` — added — checks real-browser security, viewport, and refresh acceptance (T-21, NFR-1, NFR-4, NFR-5).
- `tests/p2-storage-fault-matrix.test.js` — added — exercises storage corruption, recovery, blocked writes, and failed writes (T-20, FR-8, FR-9, NFR-6).
- `tests/page-shell.test.js` — added — verifies the app page shell and its controls (T-01, T-17, FR-1, FR-2).
- `tests/safe-renderer.test.js` — added — verifies literal text rendering and incomplete status (T-15, FR-5, FR-6, NFR-1).
- `tests/security-policy.test.js` — added — checks the no-secrets and browser-only security policy (T-03, NFR-8).
- `tests/storage-adapter.test.js` — added — covers storage reads, record recovery, and writes (T-09, FR-8, FR-9, NFR-6).
- `tests/storage-recovery.test.js` — added — verifies the blocked-write recovery gate (T-11, DR-1, NFR-6).
- `tests/task-creation-controller.test.js` — added — verifies creation, validation, storage failure, and blocked-write behavior (T-13, FR-3–FR-8, FR-10).
- `tests/task-page.test.js` — added — verifies task-page controls and required feedback (T-17, FR-1, FR-2, FR-4).
- `tests/task-state.test.js` — added — verifies ordered state, status, and candidate commit behavior (T-07, FR-3, FR-5, FR-6).
- `tests/title-validator.test.js` — added — verifies validation messages and Unicode length boundaries (T-05, FR-4, FR-10).
- `tests/verification-gaps.test.js` — added — checks missing-file safety, no-lookup/no-API scope, and documentation output constraints (Stage 7 verification).
- `user-story/_extracted.md` — added — records the extracted source story and acceptance criteria (Stage 0 intake).

## Test Evidence
From `docs/verification-report.md`:

| Command | Result | Duration |
|---|---|---|
| `npm test` | PASS: 30 passed / 0 failed / 0 skipped | 6565 ms |
| `npm test -- --experimental-test-coverage` | PASS: 30 passed / 0 failed / 0 skipped; coverage 96.61% line / 84.21% branch / 90.38% functions | 6401 ms |
| `git diff --check` | PASS: no whitespace errors | Same session |
| `npm audit --json` | Attempted; npm returned `ENOLOCK` because no lockfile exists, so the ecosystem could not be assessed. `package.json` declares no dependencies/devDependencies. | Same session |

Raw test output recorded in the report:

```text
ℹ tests 30
ℹ pass 30
ℹ fail 0
ℹ skipped 0
```

The report also records one real-browser acceptance test passed under Edge at 320 px and 1280 px, exercising script-like title text, persisted refresh restoration, and unreadable-storage replacement.

## Known Limitations
- **CR-1 (Low, open; not fixed):** `docs/impl-plan.md:3` contains trailing whitespace. Code review reports that `git diff --check main...HEAD` fails for this committed-range finding; the verification report's plain `git diff --check` pass does not resolve it.
- **Dependency audit limitation:** `npm audit --json` returned `ENOLOCK` because no lockfile exists. `package.json` declares no runtime or development dependencies, so the dependency ecosystem could not be assessed.
- **Accepted architecture mapping risks:** The §4 and §12 requirement-component mappings differ: FR-3 §12 adds In-Memory Task State and Local Storage Adapter; FR-4 §12 adds Task Page UI; FR-7 §12 adds Task Page UI and Feedback Display; FR-8 §4 includes Storage Recovery State absent from §12; NFR-1 §12 adds Title Validator; and NFR-6 §4 includes Task Page UI and Title Validator absent from §12. NFR-7's §12 “Testing Strategy” is not a component defined in §§3–4. As recorded in the approved planning decision and traceability, implementation coverage follows §12; the mapping conflicts remain unresolved.
- **Stale architecture statements:** Architecture §§1 and 10 retain pre-implementation statements that no source or build layout exists, although the application and tests now exist. These accepted documentation risks are recorded in traceability and were not silently rewritten.
- **Accepted design-review scope risks:** Cross-tab localStorage writes can lose concurrent updates; synchronization/conflict resolution is out of scope. Explicit replacement is destructive and can discard unreadable saved tasks, so it remains separately confirmed. DR-1's write gate, DR-2's no-lookup/conditional `Not Found` decision, and DR-3's requirements reconciliation are resolved decisions, not claimed as open defects.
- **Scope / verification boundaries:** No API or lookup feature exists; API failure behavior is not applicable and `Not Found` applies only if lookup is added later. No CI result is cited, and no standalone lint or type-check script is configured.

## Reviewer Checklist
- [ ] Requirements in docs/requirements.md are met (FR/NFR table checked)
- [ ] Architecture matches docs/architecture.md; deviations are documented
- [ ] No secrets/tokens in code, config, fixtures, logs, or output
- [ ] Input validation and error handling reviewed (API failure, missing file, empty input)
- [ ] Lookup/API behavior reviewed where applicable; Not Found/missing lookup behavior is conditional and out of scope; no in-scope missing-field behavior claim is fabricated
- [ ] Dependencies reviewed; no known-vulnerable versions
- [ ] Docs in sync: README, CHANGELOG, traceability.md, .env.example
- [ ] Known limitations acceptable
