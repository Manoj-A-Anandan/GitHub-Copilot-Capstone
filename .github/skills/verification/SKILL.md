---
name: verification
description: How to independently verify delivered work — run the real test suite, validate against acceptance criteria, build requirements-to-test traceability, check regressions and documentation consistency, and report an explicit PASS/FAIL/BLOCKED with evidence. Use in the verification stage.
---

# Verification

Verification proves behaviour by running it. You are independent of the implementer: do not rely on the implementer's reported results.

## Procedure
1. **Baseline**: `git status`, current commit SHA, Node version (`node --version`). Record them.
2. **Independent execution**: run the project's real command (`npm test`) yourself, in this session, from a clean state. Capture the command, exit code, pass/fail/skipped counts, duration and the raw output. If the run cannot start (missing runtime, install failure), status is `BLOCKED` with the exact reason.
3. **Acceptance criteria**: for every FR/NFR Given/When/Then in `docs/requirements.md`, find the test that exercises it (`grep` for the ID in `tests/`). Build the table `Requirement → Scenario → Test → Result`. No test → write one in `tests/` (tests and fixtures only; never change production code) and run it, or report a gap.
4. **Scenario coverage**: confirm positive, negative, boundary and edge scenarios exist for each FR (see `testing-strategy`). Missing categories are reported, not assumed.
5. **Regression validation**: the whole suite must pass, not only new tests; compare the test count with the baseline in the previous verification report and explain any decrease. Check that no existing test was removed, skipped (`.skip`, `.todo`) or weakened (`git diff <base>...HEAD -- tests/`).
6. **Defect handling**: each failure becomes a defect row (ID, severity, repro command, expected vs actual, suggested owner). Do not fix production code.
7. **Documentation consistency** (use `docs-sync-check`): README commands run as written; documented messages/limits equal the code constants; traceability rows resolve; CHANGELOG reflects user-visible changes. Execute README commands you can run safely; record those you could not.
8. **Security spot-checks**: grep for `innerHTML|eval\(|new Function`, secret-like strings (`ghp_`, `AKIA`, `-----BEGIN`), and committed `.env` files; record results.
9. **Report** in `docs/verification-report.md` with raw output pasted (the PR reuses it).

## Status definitions
| Status | When |
|--------|------|
| **PASS** | All commands ran this session, 0 failures, every Must acceptance criterion has a passing test, no unexplained regression, docs consistent |
| **FAIL** | Any test fails, any Must criterion has no passing test, a regression or doc-vs-code contradiction exists |
| **BLOCKED** | Verification could not be completed (tool/runtime missing, environment error, prerequisite artifact missing). State the exact cause and what is unverified; never convert to PASS |

## Evidence rules
- Paste real output; never paraphrase counts. Include the command line and exit code.
- Every claim in the report points to a command, file:line, or test name.
- List `Not Verified / Limitations` explicitly (e.g. real-browser behaviour not exercised).
- Secrets must not appear in the report.

## Checklist before returning
- [ ] I ran the suite myself in this session
- [ ] Requirement → test table complete; gaps listed
- [ ] Regression comparison against the previous run done
- [ ] Docs consistency checked
- [ ] Explicit PASS / FAIL / BLOCKED at the top of the report
