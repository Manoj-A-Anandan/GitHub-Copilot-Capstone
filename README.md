# Automated Documentation Sync

An agent-assisted SDLC project for synchronizing requirements and engineering documentation with approved changes to the Overtime Compensation Policy. It preserves source provenance, distinguishes policy facts from approved clarifications, and keeps human review in control of architecture and publication decisions.

## Agent Workflow

The **SDLC Orchestrator Agent** coordinates a documentation-focused software development lifecycle. It examines the repository's existing artifacts, delegates each stage to a specialist agent, tracks evidence and blockers, and pauses for human approval at required gates. It does not implement the workflow autonomously from start to finish or publish a pull request without an explicit request.

To run it:

1. Open this repository as a workspace in VS Code and make sure the workspace is trusted.
2. Sign in to GitHub Copilot and open Copilot Chat in **Agent** mode.
3. Select **SDLC Orchestrator Agent** from the agent picker.
4. Give it the source policy/documentation and the approved change to synchronize. For example: “Start the SDLC workflow for this approved policy update: [describe or attach the source].”
5. Review the evidence and outputs at each stage, and explicitly approve each required gate before asking it to continue.

The session-start hook adds a workflow reminder automatically when hooks are enabled. The Java runtime requirement for that hook is listed below.

Before starting, have the source material and change details available, identify who can approve requirements, architecture, design changes, and the implementation plan, and ensure the repository is accessible in VS Code. Existing root-level SDLC artifacts are used as context when present; missing information must be recorded as `Not Found`, not guessed.

The workflow stages are:

1. Requirements Agent
2. Architecture Agent
3. Design Review Agent
4. Implementation Planning Agent
5. Implementation Agent
6. Code Review Agent
7. Verification Agent
8. Pull Request Agent

Human approval is required at the gates documented in `.github/copilot-instructions.md`. The Pull Request Agent prepares PR material; it does not publish without an explicit request.

Custom agent definitions live in `.github/agents/`, reusable role procedures in `.github/skills/`, project instructions in `.github/instructions/`, and the session-start workflow hook in `.github/hooks/`.

## Authoritative SDLC Documents

The repository-root `requirements.md`, `architecture.md`, `design-review.md`, and `impl-plan.md` are canonical. Do not edit empty or obsolete copies under `.github/`.

## Development

The session-start hook requires a JDK 17 or newer available on `PATH`. It uses Java's source-file launcher and has no external library dependencies. VS Code with GitHub Copilot Chat is required to run the custom agents.

You can check the hook locally with:

```shell
echo {} | java .github/hooks/WorkflowContext.java
```

The command should print a JSON object containing a `systemMessage` workflow reminder. The TODO app has its own application test suite, separate from verification of the full Copilot agent workflow; running the hook check does not verify that workflow.

## TODO Application

The standalone TODO app is in `todo-app/`. From the repository root, install its dependencies and start the app with:

```shell
npm install --prefix todo-app
npm start --prefix todo-app
```

Run the app tests with:

```shell
npm test --prefix todo-app
```
