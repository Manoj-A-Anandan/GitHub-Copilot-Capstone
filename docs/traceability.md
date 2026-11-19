# Traceability Matrix

Source: `docs/requirements.md` (v3)  
Architecture: `docs/architecture.md` (v3)
Design review: `docs/design-review.md` (Round 2; DR-1, DR-2, and DR-3 resolved)
Plan: `docs/impl-plan.md` (23 tasks; P0=3, P1=16, P2=2, P3=2)
Approval: requirements v3 APPROVED; architecture v3 APPROVED; Stage 3 Round 2 APPROVED; Stage 4 Implementation Planning APPROVED by the human despite the accepted documentation risks. Stage 5 is implementation, but implementation-code and test source files remain Not Found.
Code: Not Found (implementation has not started)
Tests: planned test tasks are linked below; test files are Not Found
Upstream: `user-story/_extracted.md` (source: `user-story-create-todo-task.md`)

Task links in this matrix are transcribed from each plan task's `Covers` field. Planned tests list the applicable test/verification tasks, not every task that covers a requirement. Architecture components follow §12 for implementation coverage. Discrepancies with the component `Covers` fields in §4 are retained as unresolved semantic conflicts and are not reconciled here.

| Requirement ID | Architecture component(s) | Plan task(s) (`Covers`) | Code file(s) | Planned test task(s) | Status |
|---|---|---|---|---|---|
| FR-1 | Task Page UI | T-16, T-17, T-18, T-19, T-23 | Not Found | T-17, T-19 | Plan mapped; implementation pending |
| FR-2 | Task Page UI | T-16, T-17, T-18, T-19, T-23 | Not Found | T-17, T-19 | Plan mapped; implementation pending |
| FR-3 | Task Creation Controller; Title Validator; In-Memory Task State; Local Storage Adapter | T-06, T-07, T-12, T-13, T-18, T-19, T-23 | Not Found | T-07, T-13, T-19 | Plan mapped; implementation pending |
| FR-4 | Title Validator; Feedback Display; Task Page UI | T-04, T-05, T-12, T-13, T-17, T-18, T-19, T-23 | Not Found | T-05, T-13, T-17, T-19 | Plan mapped; exact message: `Task title is required and cannot be empty.` |
| FR-5 | Task Creation Controller; In-Memory Task State; Task List Renderer; Task Page UI | T-06, T-07, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-21, T-23 | Not Found | T-07, T-13, T-15, T-17, T-19, T-21 | Plan mapped; implementation pending |
| FR-6 | In-Memory Task State; Task List Renderer | T-06, T-07, T-12, T-13, T-14, T-15, T-18, T-19, T-23 | Not Found | T-07, T-13, T-15, T-19 | Plan mapped; incomplete status specified |
| FR-7 | Task Creation Controller; Task Page UI; Feedback Display | T-12, T-13, T-16, T-17, T-18, T-19, T-23 | Not Found | T-13, T-17, T-19 | Plan mapped; implementation pending |
| FR-8 | Task Creation Controller; In-Memory Task State; Local Storage Adapter; Feedback Display | T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-18, T-19, T-20, T-23 | Not Found | T-09, T-11, T-13, T-19, T-20 | Plan mapped; atomic save and DR-1 write gate specified; failed-save message: `Unable to save the task. Please try again.` |
| FR-9 | Local Storage Adapter; In-Memory Task State; Task List Renderer | T-06, T-08, T-09, T-14, T-18, T-19, T-20, T-21, T-23 | Not Found | T-09, T-19, T-20, T-21 | Plan mapped; refresh restoration specified |
| FR-10 | Title Validator; Task Creation Controller; Feedback Display | T-04, T-05, T-06, T-08, T-12, T-13, T-18, T-19, T-23 | Not Found | T-05, T-13, T-19 | Plan mapped; 255-code-point limit and exact message: `Task title must be 255 characters or fewer.` |
| NFR-1 | Task List Renderer; Title Validator | T-14, T-15, T-18, T-21, T-23 | Not Found | T-15, T-21 | Plan mapped; text-only rendering specified |
| NFR-2 | Title Validator; Feedback Display; Task Page UI | T-04, T-05, T-12, T-13, T-16, T-17, T-18, T-19, T-23 | Not Found | T-05, T-13, T-17, T-19 | Plan mapped; exact validation feedback specified |
| NFR-3 | Task Creation Controller; Task List Renderer; Task Page UI | T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-23 | Not Found | T-13, T-15, T-17, T-19 | Plan mapped; same-interaction feedback specified |
| NFR-4 | Task Page UI; Responsive Layout | T-16, T-17, T-19, T-21, T-22, T-23 | Not Found | T-17, T-19, T-21 | Plan mapped; 320 px and 1280 px targets specified |
| NFR-5 | Local Storage Adapter; In-Memory Task State | T-06, T-07, T-08, T-09, T-18, T-19, T-20, T-21, T-23 | Not Found | T-09, T-19, T-20, T-21 | Plan mapped; refresh restoration specified |
| NFR-6 | Local Storage Adapter; Storage Recovery State; Task Creation Controller; In-Memory Task State; Feedback Display | T-02, T-04, T-06, T-08, T-09, T-10, T-11, T-12, T-13, T-16, T-17, T-18, T-20, T-22, T-23 | Not Found | T-02, T-09, T-11, T-13, T-17, T-20 | Plan mapped; unreadable-load message: `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.`; failed-save message: `Unable to save the task. Please try again.`; DR-1 gate and atomic failure specified |
| NFR-7 | Testing Strategy; Task Creation Controller; Title Validator; Storage Recovery State; Local Storage Adapter; Task List Renderer | T-01, T-02, T-05, T-07, T-09, T-11, T-13, T-15, T-17, T-18, T-19, T-20, T-21, T-22, T-23 | Not Found | T-02, T-05, T-07, T-09, T-11, T-13, T-15, T-17, T-19, T-20, T-21 | Plan mapped; repeatable tests specified |
| NFR-8 | Architecture scope/browser-only flow; no credentials component or external service | T-02, T-03, T-22, T-23 | Not Found | T-02, T-03 | Plan mapped; no credentials required, generated, or persisted |

## Design-review disposition and scope checks

| Finding | Round 1 disposition | Round 2 disposition | Round 2 evidence |
|---|---|---|---|
| DR-1 | Open — unreadable-load writes could overwrite unknown stored data | Resolved — writes are blocked until successful reread or explicit confirmed replacement; valid submissions while blocked do not call `setItem` and preserve input/list | Architecture §§2, 4, 5, 7, 9, 11; plan T-10–T-13 and T-20; unreadable-load message: `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.` |
| DR-2 | Open — missing-data/`Not Found` lookup scope was ambiguous | Resolved — no lookup in this scope; `Not Found` applies only if lookup is introduced later | Requirements §5 and clarification 5; architecture §§5, 6, 9; plan T-18 explicitly excludes lookup and lookup tests |
| DR-3 | Accepted risk pending requirements reconciliation | Resolved — requirements v3 is the authority for exact messages and clarified behavior | Requirements v3; architecture §§5, 7, 9, 13; exact empty-title, overlength, unreadable-load, and failed-save messages are represented above |

- All 23 task `Covers` fields match the requirement-to-task mappings in plan §7 exactly for all 18 FR/NFR IDs. All task IDs, status fields, and 32 dependency edges resolve; each edge matches §1 `Depends on`, and the dependency graph has no cycle. Every requirement has at least one valid planned test-task link; test source files and implementation files are not present yet. The plan includes the DR-1 blocked-write gate, release only through successful reread or separate confirmed replacement, preserved input/list, exact unreadable-load feedback, and the read-fail-then-write-succeed test sequence (T-10–T-13, T-20).
- No lookup component or lookup test is required in this create-only scope. `Not Found` is conditional on a lookup feature being introduced later.
- Round 2 accepted risks are carried in the plan: cross-tab concurrent updates may be lost and synchronization is out of scope; destructive replacement can discard unreadable saved tasks, so it must remain a distinct, explicit confirmed action and never an Add Task side effect.

## Semantic conflicts requiring artifact-owner resolution

- **Architecture component mapping (`docs/architecture.md` §12 vs §4 `Covers` fields):** FR-3 §12 includes In-Memory Task State and Local Storage Adapter, absent from FR-3 in §4; FR-4 §12 includes Task Page UI, absent from FR-4 in §4; FR-7 §12 includes Task Page UI and Feedback Display, absent from FR-7 in §4; FR-8 §4 includes Storage Recovery State, absent from FR-8 in §12; NFR-1 §12 includes Title Validator, absent from NFR-1 in §4; and NFR-6 §4 includes Task Page UI and Title Validator, absent from NFR-6 in §12. The matrix records §12. These unresolved mappings qualify the Round 2 design-review statement that “no focused Round 2 gap” was found in requirement coverage; architecture owner should reconcile them.
- **Architecture component definition (`docs/architecture.md` §12 vs §§3–4):** NFR-7 §12 assigns coverage to “Testing Strategy,” but that name is not a component in the §3 component diagram or §4 component/responsibilities table (it appears as a strategy in §9). Round 2 says architecture v3 has “concrete tests” and “no focused Round 2 gap”; the architecture owner should clarify whether Testing Strategy is a component or only a test activity.

## Accepted human risk

The human approved Stage 4 and accepted the unresolved architecture §4/§12 component-mapping conflicts and the undefined NFR-7 “Testing Strategy” component. Implementation coverage follows architecture §12 and this traceability matrix; no upstream mapping or NFR-7 definition was rewritten or reconciled in this stage-scope sync.
