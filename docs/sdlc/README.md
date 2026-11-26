# Agentic SDLC Documentation

Version: 1   Status: Draft

This folder documents the AI-driven SDLC workflow that runs in this repository with GitHub Copilot custom agents. Pipeline artifacts for a given story (requirements, architecture, review, plan, verification, PR text) remain in `docs/`.

| Document | Purpose |
|----------|---------|
| [orchestrator.md](orchestrator.md) | Every stage: agent, inputs, outputs, preconditions, validation, next stage, failure handling, approvals; Mermaid flow; retry policy |
| [improvement-report.md](improvement-report.md) | Report on the review-feedback improvements: what changed, validation results, limitations, screenshot checklist |

## Where things live
| Concern | Location |
|---------|----------|
| Orchestrator (runtime source of truth) | `.github/agents/sdlc-orchestrator.agent.md` |
| Specialist agents | `.github/agents/*.agent.md` (requirements-analyst, architect, design-reviewer, implementation-planner, implementer, code-reviewer, verifier, docs-sync, pr-creator) |
| Skills (reusable engineering knowledge) | `.github/skills/*/SKILL.md` |
| Path-specific instructions | `.github/instructions/*.instructions.md` |
| Repository instructions | `.github/copilot-instructions.md` |
| Hooks (guardrails) | `.github/hooks/` |
| Run state and retry evidence | `.sdlc/state.md`, `.sdlc/retry-log.md` |
| Prompts | `.github/prompts/` (`run-sdlc`, `resume-sdlc`, `sync-docs`) |
| Config validation | `node scripts/validate-sdlc-config.mjs` |

## Key rules
- Stages 0–8 with human gates G0–G8; silence is never approval.
- Every stage unit has at most 2 technical attempts, then `BLOCKED`/`FAILED`; human *Request changes* is a revision cycle, never a failure.
- The code reviewer reports; only the implementer changes code, via the orchestrator.
- Every PR body carries the `AI-Assisted Pull Request` disclosure; no agent merges a PR.
- External actions (commit, push, PR, comment) are idempotent and verified against real remote state.
