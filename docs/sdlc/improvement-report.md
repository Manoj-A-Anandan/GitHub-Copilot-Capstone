# Improvement Report — Review Feedback (Rajesh)

Date: 2026-11-26   Branch: `feature/create-todo-task`   Status: Feedback changes prepared for the existing PR #1; no second PR is possible from this same branch to `main`.

## 1. Repository findings that shaped the work
- There was no `orchestrator.md`, no `docs/sdlc/` and no `scripts/`. The orchestration source of truth is `.github/agents/sdlc-orchestrator.agent.md`; `docs/sdlc/` and `scripts/` were created.
- Existing skills were only `docs-sync-check`, `pr-authoring`, `user-story-intake`. None covered requirements, design, implementation, review, testing or verification, so six new skills were justified; `pr-authoring` was extended rather than duplicated.
- `src/` is plain ES-module JavaScript (`node --test`, no dependencies). Selenium/API guidance was added as reference text only.
- PR #1 for this branch already exists and `.sdlc/state.md` is `COMPLETE`. This feedback update adds the required disclosure to the existing PR body; it does not create a second PR or alter `.sdlc/state.md`.
- Not touched: `src/`, `tests/`, `package.json`, hooks, Jira/Confluence content, remotes, credentials, `.sdlc/state.md`, existing untracked `.sdlc/logs/`.

## 2. Files inspected
`.github/agents/*.agent.md` (10), `.github/instructions/*.md` (5), `.github/skills/*/SKILL.md` (3), `.github/copilot-instructions.md`, `.github/prompts/*.md` (3), `.github/hooks/README.md`, `sdlc-hooks.json`, `.github/hooks/scripts/pre-tool-guard.sh`, `package.json`, `.gitignore`, `.sdlc/state.md`, `.sdlc/logs/sessions.log`, `README.md`, `tests/README.md`, `docs/` listing, `src/task-creation-controller.js`, `title-validator.js`, `task-state.js`, `task-list-renderer.js`, `tests/title-validator.test.js`, git status/branch/remote.

## 3. Files created
- `docs/sdlc/README.md`, `docs/sdlc/orchestrator.md`, `docs/sdlc/improvement-report.md`
- `.github/skills/requirements-analysis/SKILL.md`, `architecture-design/`, `js-implementation/`, `code-review/`, `testing-strategy/`, `verification/` (each `SKILL.md`)
- `.sdlc/retry-log.md` (header only; no live retries recorded)
- `scripts/validate-sdlc-config.mjs`

## 4. Files modified
`.github/agents/`: `sdlc-orchestrator`, `requirements-analyst`, `architect`, `design-reviewer`, `implementation-planner`, `implementer`, `code-reviewer`, `verifier`, `pr-creator`, `docs-sync` · `.github/instructions/`: `code`, `testing`, `agent-collaboration` · `.github/skills/pr-authoring/SKILL.md` · `.github/copilot-instructions.md`

## 5. Orchestrator changes
- Added the three-level model, a skills table per agent, and a validation-criteria table for every stage unit.
- Full stage reference with Mermaid flow in `docs/sdlc/orchestrator.md` (stages 0–8, gates G0–G8, mapping of the 18 requested steps to stages). Existing stage numbering and agent names were preserved; no agents were invented.
- State format gained `BLOCKED` and a *Retry counters* section; Stage 6 uses Blocker/Major/Minor/Suggestion; Stage 7 knows `BLOCKED`.

## 6. Retry implementation
- Loop for every stage unit (Stage 5 per task): prerequisites → attempt 1 → orchestrator validation → on failure log reason and details → attempt 2 with `RETRY CONTEXT` → revalidate → second failure stops with `BLOCKED`/`FAILED` and no dependent stage runs. Max 2 attempts; successful units are never re-run.
- Human *Request changes*, `OPEN QUESTIONS`, review findings and failing-test results are explicitly **not** technical failures. Human revisions return to the owning agent and re-present the same gate; the technical limit never caps them.
- Side effects (commit, push, PR create, annotate, comment) are separate reconcile-first sub-steps with explicit skip conditions and a comment marker, so retries cannot duplicate them.
- Evidence: `.sdlc/retry-log.md` and `.sdlc/state.md`.
- **Limitation:** Copilot custom agents have no retry/timeout property, so none was invented. The loop is instruction-enforced.

## 7. Skill improvements
| Skill | Content |
|-------|---------|
| `requirements-analysis` | completeness/consistency/ambiguity checks, FR vs NFR, feasibility, testability, Given/When/Then with positive/negative/boundary/edge, traceability, clarification handling |
| `architecture-design` | SoC, SOLID table with smells, DRY/KISS, pattern-vs-problem table, dependency direction, resilience, security, scalability, over-engineering checklist |
| `js-implementation` | conventions derived from the real `src/` (naming, const/let, globals, validation, errors, UI/logic separation, refactoring discipline) |
| `code-review` | 15-area checklist, Blocker/Major/Minor/Suggestion, mandatory `file:line`, report-only rule, re-review procedure |
| `testing-strategy` | positive/negative, BVA, equivalence, edge, regression, isolation, assertions, data, reports; reference-only Selenium and API guidelines |
| `verification` | independent execution, criteria traceability, regression validation, doc consistency, PASS/FAIL/BLOCKED |
Agents reference these skills by path in a `## Skills` section, and the orchestrator briefs name them. `scripts/validate-sdlc-config.mjs` asserts the references exist. Whether Copilot loads a skill at runtime is up to the platform; the agent files direct it explicitly.

## 8. AI PR annotation
The disclosure block (exact required wording) is the first section after the title in the `pr-creator` template, `pr-authoring`, and `docs/pr-description.md`. Since PR #1 already exists on this feature branch, this update will revise its body after push; GitHub does not allow creating a second open PR from the same head branch to the same `main` base. The PR will not be merged.

## 9. Validation results (actual)
| Check | Result |
|-------|--------|
| `node scripts/validate-sdlc-config.mjs` | 328 passed, 0 failed (frontmatter on 10 agents/6+3 skills/5 instructions, agent list, reference resolution, per-agent skill references, 9 stages × 7 fields, G0–G8, retry phrases, 15 checklist rows, severities, disclosure text, secret patterns) |
| Negative control (copy with disclosure heading removed, `Maximum attempts: 2` removed, skill renamed in implementer) | 322 passed, **4 failed** as expected, so the validator does detect breakage |
| Markdown fence balance, 31 `.github`/`docs/sdlc` files | 0 problems |
| Frontmatter blocks present | 0 problems. Full YAML parse **skipped** (PyYAML not installed); the validator checks `name`, `description`, `tools`/`applyTo` by line |
| `npm test` | 30 tests: 29 pass, **1 fail**: `T-21 real-browser … isolated-origin refresh`, `EPERM` while deleting its Edge profile dir. Same failure on a clean checkout of `HEAD` (run in a temporary worktree), so it predates these changes and is environmental (Windows file lock). I did not modify tests or `src/` |
| Secrets | Validator's token patterns: none found in touched docs |
| Retry demo | **Not run live.** The retry loop is orchestrator prose, so it can only be exercised by a real Copilot orchestrator run; I did not fabricate a simulation. Walkthrough below is a design example, not evidence |

Design example (not executed): Stage 4 attempt 1 returns a plan where FR-7 is missing from §7 → validation fails → row logged (`4 Planning | 1 | FAIL | VALIDATION | FR-7 absent from §7`) → attempt 2 with RETRY CONTEXT → passes → `SUCCEEDED`, G4 presented. If attempt 2 also fails → `BLOCKED`, Stage 5 `NOT_RUN`.

## 10. Limitations and open items
1. Retry/skill use are instruction-enforced, not engine-enforced; first live run should be checked against `.sdlc/retry-log.md`.
2. Pre-existing `T-21` browser-test failure on this machine (see above); the Edge processes it orphaned were stopped and its temp dirs removed.
3. `design-reviewer` keeps its own Blocker/High/Medium/Low scale (design stage); only code review moved to Blocker/Major/Minor/Suggestion. Existing `docs/code-review.md` (CR-1 Low) was left as is.
4. The existing PR #1 will receive the disclosure in its body as part of this authorized update.
5. Root `README.md` describes the app only and was not changed; `docs/sdlc/README.md` is the workflow entry point.
6. This branch update combines the feedback changes with the TODO-app changes already on `feature/create-todo-task`; it is not a feedback-only PR.

## 11. Screenshot checklist for the capstone review
1. `.github/agents/sdlc-orchestrator.agent.md`: "Stage execution loop and retry policy" and the validation table.
2. `docs/sdlc/orchestrator.md`: Mermaid flowchart rendered, plus one stage table (e.g. Stage 6).
3. `docs/sdlc/orchestrator.md` §4: retry flowchart and human revision cycle.
4. `.github/skills/code-review/SKILL.md`: 15-area checklist and severity table.
5. `.github/skills/js-implementation/SKILL.md` and `testing-strategy/SKILL.md` (reference-only Selenium/API section).
6. `.github/agents/code-reviewer.agent.md` and `implementer.agent.md`: `## Skills` sections.
7. `.github/agents/pr-creator.agent.md`: disclosure template and idempotent Phase B.
8. Terminal: `node scripts/validate-sdlc-config.mjs` (328 passed) and the negative-control failure output.
9. Terminal: `npm test` showing 29/30 with the noted pre-existing failure.
10. `.sdlc/retry-log.md` (and, after a live run, rows with attempts/reasons).
11. After the authorized PR update: verify that PR #1's GitHub body shows the "AI-Assisted Pull Request" section.
