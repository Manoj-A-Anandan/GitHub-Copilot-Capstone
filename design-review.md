# Design Review

## Review Status

- **Follow-up review date:** 2026-11-10.
- **Human decisions:** The user resolved and approved DR-01 through DR-04 and the stored-task-shape clarification on 2026-11-10. The approved requirements and architecture incorporate those decisions. This follow-up records their dispositions; it does not approve any additional requirements or architecture changes.
- **Outcome:** DR-01 through DR-04 and DR-07 are resolved by the user's recorded decisions. The approved stored-task-shape clarification is consistent across requirements, architecture, and the current repository implementation. AC-11's specified malformed-data cases and blocked-create behavior are covered by the passing automated test suite. Code Review outcome: **APPROVED**. Verification is partial, not full: Chrome/Edge checks passed, while Firefox, Safari, physical mobile, and performance verification remain outstanding. DR-05 and DR-06 remain separate recommendations only. No blocking design contradiction was identified; this status does not represent production readiness.
- **Reference format:** Source references use the word `Section`, per the user's requested format.

## Scope and Limitations

The initial review covered the approved requirements and architecture before implementation; it was not an implementation review. This follow-up covers the TODO app implementation in the current repository, authorized by the user. The implementation and focused tests were inspected, and the implementation-plan verification evidence is recorded below. Browser coverage is limited to Chrome and Edge, and the performance target remains unverified because its measurement protocol is **Not Found**. These limits do not imply full verification or production readiness.

Severity indicates the potential impact if the issue is left unresolved: **High** may cause data loss or false success; **Medium** impairs consistent behavior or objective verification; **Low** is a bounded maintainability or residual-risk concern.

## Findings

### DR-01: Persistence failures and malformed stored data

- **Severity:** High
- **Areas:** Correctness, reliability, failure handling, security boundary
- **Disposition:** Resolved by user-approved DR-01, recorded in requirements and architecture on 2026-11-10.
- **Evidence:** Requirements FR-03, FR-07, FR-11, FR-12 and AC-07/AC-08 specify that unavailable/full storage, failed writes, and malformed JSON block creation, show an inline error, and preserve the input; malformed JSON reads default to `[]`. Architecture, Data Flow and Reliability, specify the same behavior and prohibit creation while malformed storage remains detected.
- **Impact:** The former ambiguity about creation success, input clearing, and storage-error feedback is resolved. The malformed-JSON fallback and creation guard are compatible if the implementation retains a detectable malformed-state result alongside the fallback task list; the fallback alone must not be interpreted as valid empty storage. Recovery beyond the read fallback remains **Not Found** and is an explicit limitation, not a contradiction in the approved behavior.
- **Practical recommendation:** Implement the approved behavior without overwriting malformed data. Keep the parse-failure signal available to the creation flow even when the displayed/read task collection safely defaults to `[]`. No additional recovery policy is approved.

### DR-02: Valid-title whitespace normalization

- **Severity:** Medium
- **Areas:** Correctness, completeness, traceability
- **Disposition:** Resolved by user-approved DR-02, recorded in requirements and architecture on 2026-11-10.
- **Evidence:** Requirements FR-03, FR-04, AC-06, and Business Rules require trimming leading/trailing whitespace from valid titles while rejecting empty or whitespace-only titles. Architecture, Overview, Components, and Data Flow specify the same normalization.
- **Impact:** Valid-title normalization is now consistent and testable; the former implementation variance is removed.
- **Practical recommendation:** Preserve the approved trim-and-reject behavior in implementation and tests.

### DR-03: Browser compatibility and responsive acceptance

- **Severity:** Medium
- **Areas:** Completeness, reliability, traceability
- **Disposition:** Resolved by user-approved DR-03, recorded in requirements and architecture on 2026-11-10.
- **Evidence:** Requirements NFR-03 and AC-09 specify modern evergreen desktop/mobile Chrome, Safari, Firefox, and Edge, responsive layout, and no horizontal scrolling at mobile viewports. Architecture, Overview, Technology Choices, and Risks and Trade-offs use the same target.
- **Impact:** The supported browser families and observable responsive outcome are defined. Exact browser version cutoffs and viewport dimensions remain **Not Found**, so test-case boundaries will still need to be chosen or reported during planning without changing the approved support statement.
- **Practical recommendation:** Plan verification against the approved browser families and mobile no-horizontal-scroll criterion. Do not treat unspecified version cutoffs or viewport dimensions as new product decisions.

### DR-04: Performance, input modalities, and usability criteria

- **Severity:** Medium
- **Areas:** Performance, completeness, maintainability of acceptance criteria
- **Disposition:** Resolved by user-approved DR-04 for performance and input modalities, recorded in requirements and architecture on 2026-11-10. It does not resolve the separate qualitative objective in NFR-01.
- **Evidence:** Requirements NFR-02, NFR-06, AC-10 specify UI updates and LocalStorage writes under 100 ms and task creation through keyboard navigation or touch/click. Architecture, Overview and Technology Choices, records those same targets. Requirements NFR-01 still has objective evaluation criteria **Not Found**.
- **Impact:** The prior missing response-time target and input-mode ambiguity are resolved. The measurement environment/method remains **Not Found**, and NFR-01's “simple and user-friendly” objective remains subjective; neither creates a contradiction with DR-04.
- **Practical recommendation:** Plan a verification method for the approved under-100-ms targets and test both approved input modes. A human decision is still needed only if objective NFR-01 criteria are intended to be a release gate; do not infer such criteria from DR-04.

### DR-05: Logical boundaries are suitable, but should not force unnecessary structure

- **Severity:** Low
- **Areas:** Maintainability, unnecessary complexity, scalability
- **Disposition:** Recommendation only; AD-02 remains approved and is not changed here.
- **Evidence:** AD-02 approves separate logical responsibilities for interface, creation/validation, in-memory state, and storage, while both the requirements and architecture state that code organization and task-volume targets are **Not Found**. The current `todo-app/` implementation is a standalone browser app using plain JavaScript, HTML/CSS, and LocalStorage, within the approved local, single-user scope and without a backend.
- **Impact:** Treating each logical responsibility as a mandatory module or adding infrastructure without evidence could overcomplicate a small application. Conversely, keeping the responsibilities conceptually distinct leaves room for focused testing and later change.
- **Practical recommendation:** Keep the approved boundaries lightweight in the current implementation. Avoid introducing frameworks, backend services, migration machinery, or scale optimizations unless repository evidence or an approved requirement justifies them. No task-volume or scalability target should be inferred.

### DR-06: Local-storage security guidance is appropriate; repository controls remain unverified

- **Severity:** Low
- **Areas:** Security, reliability
- **Disposition:** Recommendation only; no new security requirement is asserted.
- **Evidence:** Approved AD-03 calls for text-safe title rendering and treating loaded data as untrusted. The current `todo-app/app.js` validates loaded task data against the approved shape and renders task titles as text; the focused tests cover invalid stored shapes and text rendering. The architecture also notes that same-origin scripts can access local storage and that browser data can be modified or cleared.
- **Impact:** The approved design reduces markup-injection risk at the rendering boundary, but it does not establish repository-level protections or data confidentiality. Local storage must not be treated as a trusted or durable backup.
- **Practical recommendation:** Preserve AD-03 and its tested behavior. The local-storage limitations remain; if confidentiality, tamper resistance, or recovery beyond normal refresh is required, obtain an explicit requirement rather than assuming it from the TODO story.

### DR-07: Structurally invalid stored task data

- **Severity:** High
- **Areas:** Correctness, reliability, failure handling, traceability, testability
- **Disposition:** Resolved by the user-approved stored-task-shape clarification dated 2026-11-10 and implemented/tested in the current repository. This finding records the clarification and its evidence; it does not change DR-05 or DR-06 or add an approval.
- **Evidence:** Requirements FR-11, FR-12, AC-11 and the validation scenarios define valid stored data as a JSON array of records with a string `title` and boolean `completed`. For malformed JSON or an invalid root/entry shape, reads default to `[]` while corruption remains detectable; the application shows an inline error, blocks creation, preserves the raw stored value, and retains the input after a failed create attempt. Architecture Overview, Components, Data Flow, Reliability, and API / Integration Boundaries specify the same behavior. In `todo-app/app.js` and `todo-app/tests/app.test.js`, automated tests cover malformed JSON, an object root, `[null]`, missing/non-string `title`, and non-boolean `completed`, asserting `[]` fallback, detectable corruption status, blocked create/write, inline error, preserved input, and unchanged raw value. `npm test --prefix todo-app` passed with 16 tests. The implementation plan also records passing HTTP allowlist smoke checks and `git diff --check`; browser and performance limitations are recorded above.
- **Impact:** The approved stored-data contract is implemented and its specified invalid root/entry cases are covered by automated tests. No design-level contradiction remains. The recorded test and review outcomes do not constitute full verification: Firefox, Safari, physical mobile, and the under-100-ms performance target remain unverified.
- **Practical recommendation:** No additional implementation action is recommended for the specified AC-11 cases. Do not treat additional record fields as invalid or add recovery behavior unless separately approved; those details remain **Not Found**.

## Observations (Not Findings)

- The core creation flow is traceable from story Sections 3-5 through FR-01–FR-12 and the architecture's component responsibilities and data flow. The approved stored-task-shape clarification dated 2026-11-10 is consistent across the requirements, architecture, current implementation, and focused tests.
- Malformed JSON has two intentionally different outcomes: task reads safely yield `[]`, while a separately detected malformed-storage condition blocks task creation, shows an inline error, and preserves the entered title. This is coherent provided implementation does not discard the detection signal when applying the read fallback. The documents do not specify recovery beyond this behavior.
- The client-only, single-user, local-storage scope and the exclusion of backend integration are grounded in the source story and reflected consistently in AD-01. The review does not recommend expanding that scope.
- AD-03 addresses the most direct rendering and persisted-input concerns for the stated feature. Its text rendering and invalid-data handling are present in the current implementation and covered by tests. It is an approved architecture decision, not a newly imposed control.
- Local storage is capacity-bounded, but the approved scope supplies no task-count or workload target. No scalability failure can be established from the available sources; DR-05 recommends avoiding unsupported optimization.

## Residual Open Items

- Recovery or repair after malformed stored JSON is detected remains **Not Found** in requirements and architecture. The approved `[]` read fallback and creation block define current behavior, and the implementation/tests cover that behavior. A human decision is needed before specifying any recovery behavior beyond that contract.
- Exact browser version cutoffs, mobile viewport dimensions, and the performance measurement environment/method remain **Not Found**. Planning can define a verification approach while preserving the approved browser families, responsive outcome, and under-100-ms targets; it must not present test parameters as newly approved product requirements.
- Requirements NFR-01 still describes the interface as “simple and user-friendly” without objective evaluation criteria. A human decision is needed only if this qualitative goal is intended to be a release gate. DR-04 does not settle that question.
- Exact validation/storage-error wording and duration, title length/character limits, and handling of missing or otherwise unreadable storage are still **Not Found**. No behavior for these cases is approved by DR-01 through DR-04.

## Human Decisions and Next Gate

The user resolved and approved DR-01 through DR-04 and the stored-task-shape clarification on 2026-11-10; the updated requirements and architecture incorporate these decisions. The current repository implementation was reviewed against the approved contract, and the recorded Code Review outcome is **APPROVED**. Automated verification passed all 16 tests, including the AC-11 invalid-shape cases. HTTP allowlist smoke checks and `git diff --check` also passed. Verification is not complete: Chrome and Edge were checked, while Firefox, Safari, and physical mobile remain unverified; the performance target remains unverified because its measurement protocol is **Not Found**; and `npm audit` was blocked by registry DNS failure (`EAI_AGAIN`). These results do not establish full verification or production readiness. This follow-up does not approve additional requirements or architecture changes.

DR-05 and DR-06 remain distinct recommendations, not required architecture changes: DR-05 concerns keeping logical boundaries proportionate and avoiding unsupported complexity; DR-06 concerns local-storage security limits and preserving text-safe/untrusted-data handling. The residual items above remain explicit unknowns. Human decisions are required before adding behavior for malformed-data recovery or treating NFR-01's qualitative usability statement as a release gate; they do not invalidate the already-approved bounded behavior. These unknowns do not revoke the recorded Code Review outcome, but they remain verification or decision limits as stated. Any proposed change to approved requirements or architecture still requires human approval.