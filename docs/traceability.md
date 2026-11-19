# Traceability Matrix

Source: [requirements.md](requirements.md) (v3, approved)<br>
Architecture: [architecture.md](architecture.md) (v3, approved)<br>
Design review: [design-review.md](design-review.md) (Round 2, approved; DR-1, DR-2, and DR-3 resolved)<br>
Plan: [impl-plan.md](impl-plan.md) (23 tasks; P0 T-01–T-03 Done; all later tasks Todo)<br>
State: [`.sdlc/state.md`](../.sdlc/state.md) (Stage 5 Implementation, P0, WAITING_FOR_HUMAN)<br>
Upstream: [`user-story/_extracted.md`](../user-story/_extracted.md) (source: [`user-story-create-todo-task.md`](../user-story-create-todo-task.md))

P0 verification reported `npm test` successful: 7 tests, 7 passed, 0 failed, all other counters 0. The project uses Node's built-in test runner and has no dependencies. Current P0 source and test paths are linked where they exist. P1+ implementation and test source paths are `Not Found`; their plan tasks remain Todo. Tests currently establish the page shell, test-fixture capabilities, and no-secrets policy—not the P1+ task behavior.

Task mappings are transcribed from each plan task's `Covers` field. Planned test tasks list the applicable test/verification tasks; source paths are linked only when present and implemented. Requirement-to-component mappings follow architecture §12. The accepted architecture §4/§12 mapping conflicts and undefined NFR-7 “Testing Strategy” component are retained below and are not reconciled here.

| Requirement ID | Architecture component(s) (§12) | Plan task(s) (`Covers`) | Code/config file(s) present | Test source(s) present | Status |
|---|---|---|---|---|---|
| FR-1 | Task Page UI | T-16, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-2 | Task Page UI | T-16, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-3 | Task Creation Controller; Title Validator; In-Memory Task State; Local Storage Adapter | T-06, T-07, T-12, T-13, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-4 | Title Validator; Feedback Display; Task Page UI | T-04, T-05, T-12, T-13, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-5 | Task Creation Controller; In-Memory Task State; Task List Renderer; Task Page UI | T-06, T-07, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-21, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-6 | In-Memory Task State; Task List Renderer | T-06, T-07, T-12, T-13, T-14, T-15, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-7 | Task Creation Controller; Task Page UI; Feedback Display | T-12, T-13, T-16, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-8 | Task Creation Controller; In-Memory Task State; Local Storage Adapter; Feedback Display | T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-18, T-19, T-20, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-9 | Local Storage Adapter; In-Memory Task State; Task List Renderer | T-06, T-08, T-09, T-14, T-18, T-19, T-20, T-21, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| FR-10 | Title Validator; Task Creation Controller; Feedback Display | T-04, T-05, T-06, T-08, T-12, T-13, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| NFR-1 | Task List Renderer; Title Validator | T-14, T-15, T-18, T-21, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| NFR-2 | Title Validator; Feedback Display; Task Page UI | T-04, T-05, T-12, T-13, T-16, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| NFR-3 | Task Creation Controller; Task List Renderer; Task Page UI | T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-23 | Not Found (feature implementation) | Not Found (behavior test; mapped tasks Todo) | P1+ pending |
| NFR-4 | Task Page UI; Responsive Layout | T-16, T-17, T-19, T-21, T-22, T-23 | Not Found (feature implementation) | Not Found (viewport behavior test; mapped tasks Todo) | P1+ pending |
| NFR-5 | Local Storage Adapter; In-Memory Task State | T-06, T-07, T-08, T-09, T-18, T-19, T-20, T-21, T-23 | Not Found (feature implementation) | Not Found (persistence/refresh behavior test; mapped tasks Todo) | P1+ pending |
| NFR-6 | Local Storage Adapter; Storage Recovery State; Task Creation Controller; In-Memory Task State; Feedback Display | T-02, T-04, T-06, T-08, T-09, T-10, T-11, T-12, T-13, T-16, T-17, T-18, T-20, T-22, T-23 | Not Found (recovery implementation); [`tests/fixtures/browser-fixtures.js`](../tests/fixtures/browser-fixtures.js) provides test-only storage exception injection and call observation | [`tests/fixtures.test.js`](../tests/fixtures.test.js) verifies fixture capabilities only; Not Found (recovery behavior test, P1+ Todo) | P0 fixture foundation T-02 Done; recovery behavior pending |
| NFR-7 | Testing Strategy; Task Creation Controller; Title Validator; Storage Recovery State; Local Storage Adapter; Task List Renderer | T-01, T-02, T-05, T-07, T-09, T-11, T-13, T-15, T-17, T-18, T-19, T-20, T-21, T-22, T-23 | [`package.json`](../package.json) configures `npm test` with `node --test`; [`src/index.html`](../src/index.html), [`src/styles.css`](../src/styles.css), and [`src/app.js`](../src/app.js) provide the P0 page shell | [`tests/page-shell.test.js`](../tests/page-shell.test.js) (T-01 shell check); [`tests/fixtures.test.js`](../tests/fixtures.test.js) (T-02 fixture checks); Not Found (P1+ behavior tests) | P0 command, shell, and fixture foundation done; remaining verification pending |
| NFR-8 | Architecture scope/browser-only flow; no credentials component or external service | T-02, T-03, T-22, T-23 | [`src/app.js`](../src/app.js), [`src/index.html`](../src/index.html), [`src/styles.css`](../src/styles.css), [`package.json`](../package.json), and [`.env.example`](../.env.example) | [`tests/security-policy.test.js`](../tests/security-policy.test.js) (T-03 no-secrets policy checks) | P0 policy/config check T-03 Done; remaining documentation tasks Todo |

## Planned test-task links

These are the plan's test/verification task mappings. Actual test source paths are shown in the matrix above; where only P1+ tasks are mapped, their source paths remain `Not Found` until implemented.

| Requirement ID | Planned test task(s) |
|---|---|
| FR-1 | T-17, T-19 |
| FR-2 | T-17, T-19 |
| FR-3 | T-07, T-13, T-19 |
| FR-4 | T-05, T-13, T-17, T-19 |
| FR-5 | T-07, T-13, T-15, T-17, T-19, T-21 |
| FR-6 | T-07, T-13, T-15, T-19 |
| FR-7 | T-13, T-17, T-19 |
| FR-8 | T-09, T-11, T-13, T-19, T-20 |
| FR-9 | T-09, T-19, T-20, T-21 |
| FR-10 | T-05, T-13, T-19 |
| NFR-1 | T-15, T-21 |
| NFR-2 | T-05, T-13, T-17, T-19 |
| NFR-3 | T-13, T-15, T-17, T-19 |
| NFR-4 | T-17, T-19, T-21 |
| NFR-5 | T-09, T-19, T-20, T-21 |
| NFR-6 | T-02, T-09, T-11, T-13, T-17, T-20 |
| NFR-7 | T-02, T-05, T-07, T-09, T-11, T-13, T-15, T-17, T-19, T-20, T-21 |
| NFR-8 | T-02, T-03 |

## Design-review disposition and scope

| Finding | Round 2 disposition | Evidence |
|---|---|---|
| DR-1 | Resolved | Architecture §§2, 4, 5, 7, 9, 11; plan T-10–T-13 and T-20 specify the blocked-write gate, recovery actions, and tests. The implementation and recovery behavior tests are P1+ and not yet present. |
| DR-2 | Resolved | Requirements §5 and clarification 5; architecture §§5, 6, 9; plan T-18 excludes lookup and lookup tests. |
| DR-3 | Resolved | Requirements v3 is the authority for exact messages and clarified behavior; architecture v3 uses that authority. |

- Architecture §12 is used for the matrix's component mappings as approved in `.sdlc/state.md`; the §4/§12 discrepancies remain unresolved semantic conflicts.
- Current files and tests are the P0 scaffold, fixtures, and policy checks. They do not implement or test the P1+ task creation, persistence, recovery, rendering, or responsive behavior.
- No lookup component or lookup test is required in this create-only scope. `Not Found` is conditional on a lookup feature being introduced later.
- Accepted risks retained from Round 2: cross-tab concurrent updates may be lost and synchronization is out of scope; explicit replacement can discard unreadable saved tasks and must remain distinct and explicitly confirmed.

## Accepted semantic conflicts (not reconciled)

- **Architecture component mapping (§12 vs §4 `Covers` fields):** FR-3 §12 includes In-Memory Task State and Local Storage Adapter, absent from FR-3 in §4; FR-4 §12 includes Task Page UI, absent from FR-4 in §4; FR-7 §12 includes Task Page UI and Feedback Display, absent from FR-7 in §4; FR-8 §4 includes Storage Recovery State, absent from FR-8 in §12; NFR-1 §12 includes Title Validator, absent from NFR-1 in §4; and NFR-6 §4 includes Task Page UI and Title Validator, absent from NFR-6 in §12. Coverage follows §12.
- **Undefined NFR-7 component:** Architecture §12 assigns NFR-7 to “Testing Strategy,” but that name is not a component in the §3 diagram or §4 component table (it appears as a strategy in §9). This traceability matrix retains that accepted mapping without treating the term as a defined component.
- **Architecture pre-implementation statements stale:** Architecture §§1 and 10 still state that no application source/build configuration exists, but P0 implementation now provides `src/index.html`, `src/styles.css`, `src/app.js`, `package.json`, P0 tests, and test fixtures. These statements describe the approved pre-implementation baseline and are stale relative to the current implementation; they are retained rather than silently rewritten.
