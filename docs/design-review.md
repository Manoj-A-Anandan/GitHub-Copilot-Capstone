# Design Review — Create a TODO Task

Reviewed: docs/architecture.md v2   Reviewer: design-reviewer

## Round 1
### Findings
| ID | Severity | Area | Finding | Evidence | Recommendation | Status |
|----|----------|------|---------|----------|----------------|--------|
| DR-1 | High | Failure modes / data integrity | After an unreadable whole-value load, the design initializes an empty in-memory list but does not prevent a later successful submission from replacing the stored value with that empty-based candidate. A transient read exception followed by a successful write could overwrite tasks the application did not load. | architecture.md §§5–7: unreadable data loads zero tasks; writes replace the whole candidate value; no write gate is specified after a read/recovery error. | Define and implement a write policy for a session whose initial read was unreadable. Recommended default: refuse writes until storage can be read successfully (or the user explicitly confirms replacement), preserve the input, and show the storage error. Add a test where reading fails but writing succeeds and verify the chosen policy. | Open |
| DR-2 | Medium | Requirement coverage / correctness | The requirements' missing-data rule says a missing requested task or persisted record shall render `Not Found`, but the design says this story has no task lookup operation and allocates no lookup component or test. The condition is only addressed hypothetically, leaving its applicability and implementation boundary unclear. | requirements.md §5; architecture.md §§5–6 and §9; architecture.md §12 has no lookup owner. | State explicitly whether the create-task scope contains any lookup operation. If none, record the rule as conditional on a lookup being introduced and avoid implying an unimplemented path is covered; if one exists, assign its component and add a repeatable `Not Found` test. Do not add a lookup feature without scope approval. | Open |
| DR-3 | Medium | Documentation sync / traceability | The approved human clarifications used by architecture v2 conflict semantically with the still-approved requirements text, which says the exact validation text, title maximum, and storage recovery remain unspecified. This leaves two different sources for the acceptance oracle. | requirements.md §§6, 8; architecture.md §§1, 11; .sdlc/state.md “Docs-sync log” for Stage 2. | Keep the conflict explicitly tracked and, in the designated docs-sync step, obtain/record the authority for updating the requirements or otherwise reconciling the documents. Until then, cite the recorded human decisions as the source for v2 behavior; do not silently reinterpret or edit requirements in this review. | Accepted risk (documented; pending docs sync) |

### Lens-by-lens coverage
- **Requirement coverage:** FR-1–FR-9 and NFR-1–NFR-7 each have component/test traceability in architecture.md §§4, 9, and 12. The conditional `Not Found` data-interface rule is the gap described in DR-2. No unrelated component without a stated requirement was found; the responsive-layout responsibility supports NFR-4.
- **Correctness of data flow:** The validate → candidate write → commit/render → clear sequence is coherent, and the input is retained on write failure. DR-1 identifies the remaining unsafe transition after an unreadable startup load.
- **Failure modes:** Absent, malformed, partially malformed, read-exception, and write-exception cases have explicit handling and tests. DR-1 is the uncovered read-error-then-successful-write case.
- **Security:** No issues found. Untrusted titles are rendered through text APIs, validation is applied to restored records, storage errors avoid exception details, and no credentials or external services are introduced.
- **Testability:** The design identifies unit/integration seams and maps tests to every FR/NFR. Add the DR-1 sequence and resolve whether the conditional `Not Found` path needs a test under DR-2.
- **Maintainability & simplicity:** No issues found. The proposed browser-only design is proportionate to the stated scope; the modules have distinct responsibilities.
- **Operability & portability:** No issues found. The design avoids server/runtime dependencies, defines generic user-visible storage errors, and includes the required 320 px and 1280 px layout checks. No CI or deployment requirement is stated.
- **Documentation sync:** DR-3 records the known semantic conflict. The architecture acknowledges it, but the source requirements remain inconsistent with the approved clarifications.

### Questions for the human
- For DR-1, should task creation be blocked after an unreadable initial storage load even if a later write could succeed? Suggested default: block until a successful read or explicit user-confirmed replacement.
- For DR-2, does the `Not Found` rule require a lookup path in this create-only story, or is it conditional on a lookup operation existing? Suggested default: no lookup feature in scope; test the rule only if such an operation is present.
- DR-3 is an already documented semantic conflict, not a request for this reviewer to change requirements. Reconcile it through the approved docs-sync process.

### Verdict: Rework required

## Agreed Design Decisions
| ID | Decision | Rationale | Decided by (human / architect) | Round |
|----|----------|-----------|--------------------------------|-------|
| — | No new decisions recorded in this review. | — | — | 1 |

## Architecture changes made as a result
| Finding | Change in architecture.md | Version |
|---------|---------------------------|---------|
| — | None; architecture.md was not edited. | — |

## Round 2
### Findings
| ID | Severity | Area | Finding | Evidence | Recommendation | Status |
|----|----------|------|---------|----------|----------------|--------|
| DR-1 | High | Failure modes / data integrity | The unreadable-initial-load overwrite risk is resolved. Architecture v3 adds a `BLOCKED_WRITES` state, keeps the gate until successful reread or separate explicit replacement confirmation, prevents `setItem` for a valid submission while blocked, preserves input/list, and includes the read-fail-then-write-succeed test sequence. | architecture.md §2 ("Read/write recovery"), §4 (`Storage Recovery State`), §§5 and 7, §9 (`DR-1` test sequence), and §11. | Retain the gate and required test sequence in implementation. | Resolved |
| DR-2 | Medium | Requirement coverage / correctness | The lookup ambiguity is resolved by the v3 revisions and human decision: no lookup feature is now in scope, and `Not Found` is conditional only for a lookup introduced later. Architecture v3 states this consistently and requires no lookup component or test. | requirements.md §5 and clarification log item 5; architecture.md §5 (`DR-2`), §6, and §9. | No implementation or lookup test is required now. | Resolved |
| DR-3 | Medium | Documentation sync / traceability | The documentation conflict is resolved. Requirements v3 now records the exact overlength, unreadable-load, and failed-save messages and the human decisions, and architecture v3 is rebased on that approved authority. Architecture v3 uses the exact required text at §5, §7, and §9. | requirements.md §3 FR-4/FR-10 and FR-8; §4 NFR-6; §5 missing-data rule; architecture.md §5, §7, §9, and §13. | No further reconciliation action is required. | Resolved |

### Lens-by-lens focused coverage
- **Prior finding re-evaluation:** DR-1 is resolved, DR-2 is resolved, and DR-3 is resolved.
- **Requirement coverage:** no focused Round 2 gap found. Architecture v3 covers the revised exact-message requirements and write-gate decision.
- **Correctness of data flow:** the submit flow validates first, checks the recovery gate for valid titles, stages one candidate, calls `setItem` once only when allowed, and commits UI state only after success. Reread and explicit replacement are separate recovery actions.
- **Failure modes:** unreadable initial load, reread failure/success, explicit replacement, malformed arrays, and failed writes are specified with fixed feedback and atomic write behavior.
- **Security:** no new focused issue found.
- **Testability:** architecture v3 contains concrete tests for Unicode code-point boundaries, exact messages, unreadable-load write blocking, reread/replacement release, and atomic write failure.
- **Maintainability & simplicity:** no new focused issue found.
- **Operability & portability:** no new focused issue found.
- **Documentation sync:** requirements v3 and architecture v3 are semantically reconciled.

### Round 2 lens verdict
No new findings.

### Questions for the human
None. The prior human decisions are recorded in requirements v3 and implemented consistently in architecture v3.

### Remaining risks
- Architecture v3 explicitly retains the existing cross-tab concurrency limitation: multiple tabs may replace the key concurrently, but conflict resolution is outside scope. This is an accepted scope risk, not a blocker for the create-only story.
- Explicit replacement remains destructive and is correctly separated from ordinary Add Task; implementation must present a clear confirmation and must not trigger replacement automatically.

### Verdict: Approve

## Agreed Design Decisions
| ID | Decision | Rationale | Decided by (human / architect) | Round |
|----|----------|-----------|--------------------------------|-------|
| DR-1 | Block writes after an unreadable initial load until a successful reread or explicit user-confirmed replacement. | Prevents unknown existing storage from being overwritten after a read failure. | Human / architect | 2 |
| DR-2 | Keep lookup and `Not Found` behavior out of the current create-only scope; apply `Not Found` only if lookup is later introduced. | Matches the human clarification and avoids adding an out-of-scope feature. | Human / architect | 2 |
| DR-3 | Use requirements v3 as the authority for exact messages and title/storage behavior. | Requirements v3 now records the approved clarifications consistently with architecture v3. | Human / architect | 2 |

## Architecture changes made as a result
| Finding | Change in architecture.md | Version |
|---------|---------------------------|---------|
| DR-1 | Architecture v3 added the unreadable-load write gate, reread/replacement recovery flows, exact unreadable-load/failed-save messages, and DR-1 test sequence. | 3 |
| DR-2 | Architecture v3 explicitly made lookup and `Not Found` conditional and out of scope. | 3 |
| DR-3 | Architecture v3 was rebased on requirements v3 and uses the exact approved messages and clarified behavior. | 3 |
