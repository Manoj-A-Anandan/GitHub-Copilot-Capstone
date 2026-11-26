---
name: code-review
description: Practical 15-area code review checklist with severity classification (Blocker, Major, Minor, Suggestion) and mandatory file:line evidence. The reviewer reports; it never edits production code. Use in the code review stage and when re-reviewing after remediation.
---

# Code review

## Ground rules
- **Report, never fix.** You may write only `docs/code-review.md`. Findings go to the orchestrator, which delegates remediation to `implementer`. If you are tempted to edit `src/` or `tests/`, write a finding instead.
- **Evidence or it did not happen.** Every finding has `path:line` (or `path:start-end`), the offending snippet or behaviour in a few words, why it matters, and a concrete recommendation. No evidence → drop the finding.
- Review against the approved requirements, architecture and plan, and against `js-implementation` as the coding standard. Run read-only checks (`npm test`, linter if present, `npm audit` if a lockfile/dependencies exist). If a tool is missing, record `Not Found: <tool>`.
- Do not report what a configured linter already enforces unless it fails. No taste-only comments; use `Suggestion` sparingly.

## Severity
| Severity | Meaning | Examples | Effect |
|----------|---------|----------|--------|
| **Blocker** | Wrong or unsafe behaviour; breaks a Must requirement; security hole; data loss | XSS via `innerHTML`, secret in code, write before validation passes, failing tests | Must fix; verdict `Changes required` |
| **Major** | Likely bug, missing required test, significant maintainability or regression risk | unhandled `JSON.parse` failure, FR with no test, duplicated rule that already diverged | Must fix before G6 |
| **Minor** | Small correctness/readability/consistency issue | unclear name, missing boundary test, dead code | Fix or accept with a note |
| **Suggestion** | Optional improvement | simpler construct, extra assertion | No action required |
(Legacy reports used Blocker/High/Medium/Low. Existing findings map High→Major, Medium→Minor, Low→Minor or Suggestion; do not rewrite historical rows, just use the new scale for new findings.)

## Checklist (all 15 areas are mandatory; each gets Pass / Pass with notes / Fail)
| # | Area | What to check, concretely |
|---|------|---------------------------|
| 1 | Functional correctness | Trace each changed function with a normal, a boundary and a failing input. Off-by-one on limits, async ordering, state mutated before success, wrong return shape |
| 2 | Requirement compliance | Map every FR/NFR in scope to code and a test; exact message texts and limits match `docs/requirements.md`; nothing implemented that no requirement asks for |
| 3 | JS naming conventions | camelCase vars/functions, PascalCase classes, UPPER_SNAKE constants, kebab-case files, intent-revealing names, `is/has` booleans |
| 4 | SOLID (where applicable) | God function/class (SRP); edits to a growing switch (OCP); fakes that break the contract (LSP); fat dependencies (ISP); logic that builds its own globals/storage instead of receiving them (DIP). Say "not applicable" when it is |
| 5 | DRY and KISS | Same rule/constant/message in two places; abstraction with one caller; config nobody needs |
| 6 | Design patterns | Pattern used for a real problem and matching `docs/architecture.md`; or a missing pattern whose absence causes a concrete defect. Pattern-for-pattern's-sake is a finding |
| 7 | Readability and maintainability | Function length/nesting, naming, comment explains *why* not *what*, module cohesion, dead or commented-out code |
| 8 | Duplicate code | Near-identical blocks (including in tests/fixtures); fallback stubs repeated; list each with both locations |
| 9 | Error and exception handling | `try/catch` scope minimal, no swallowed errors, failures converted to documented messages, no partial state on failure, no stack traces to users |
| 10 | Input validation | Every boundary (UI input, storage data, parsed JSON, arguments) checks type, length/range, content; validation precedes side effects; Unicode/whitespace handled as the requirement says |
| 11 | Security vulnerabilities | `innerHTML`/`eval`/`new Function`/inline handlers with data; injection into commands/queries; path traversal; secrets in code/fixtures/logs/output; trusting stored data; unsafe deserialization; overly broad permissions |
| 12 | Performance | Needless re-render/re-parse in loops, O(n²) over user-sized lists, sync work on hot paths, unbounded growth. Only flag where realistic load makes it matter |
| 13 | Regression risks | Behaviour or contract changes (message text, return shape, exported names) with callers/tests not updated; changed shared helpers; removed or weakened tests |
| 14 | Test coverage | Positive, negative, boundary and failure paths covered; assertions meaningful (specific values, not "no throw"); tests isolated and deterministic; requirement IDs in test names |
| 15 | Dependency and configuration safety | New/changed dependencies justified and pinned; `npm audit` result; no secrets in config; `.env.example` and `.gitignore` consistent; no change to remotes/credentials |

## Process
1. Read requirements, architecture, plan, then `git diff <base>...HEAD` and each changed file in full (not only hunks).
2. Run read-only checks; save the exact commands and results.
3. Walk the 15 areas; record findings with IDs `CR-n` (never renumber).
4. Fill the traceability table (Requirement → Code → Test → Verdict) and the dependency audit.
5. Verdict: `Approve` (no Blocker/Major), `Approve with notes` (Minor/Suggestion only), `Changes required` (any Blocker/Major).
6. On re-review, keep history: set each finding `Fixed` (cite the new `file:line`), `Won't fix (reason)`, or `Open`; check the fix did not cause regressions (area 13).
7. Report to the orchestrator: verdict, counts by severity, list of Blocker/Major with `file:line`.

## Finding format
```
| CR-3 | Major | 11 Security | src/task-list-renderer.js:12 | Title written via innerHTML | User text can inject markup | Use textContent | Open |
```
