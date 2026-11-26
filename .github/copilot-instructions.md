# Repository instructions

- Follow `.github/instructions/agent-collaboration.instructions.md` for agent ownership, self-contained briefs, open questions, and bounded review loops.
- Follow `.github/agents/sdlc-orchestrator.agent.md` for the stage sequence, human approval gates, `.sdlc/state.md` ownership and format, and documentation sync.
- For delegated work, follow the applicable `.github/agents/*.agent.md` instructions and edit only artifacts within the assigned scope.
- Follow `docs/sdlc/orchestrator.md` for the full stage reference. Every stage runs through the orchestrator's retry loop (max 2 attempts, logged in `.sdlc/retry-log.md`); human "Request changes" is a revision cycle, not a failure.
- Use the skills in `.github/skills/` named in each agent file (`requirements-analysis`, `architecture-design`, `js-implementation`, `code-review`, `testing-strategy`, `verification`, `pr-authoring`, `docs-sync-check`, `user-story-intake`).
- Every PR body contains the `AI-Assisted Pull Request` disclosure (see `pr-authoring`). No agent merges a PR.
