---
name: architecture-design
description: Design principles and review lenses for architecture work — separation of concerns, SOLID, DRY/KISS, fitting design patterns, modularity, scalability, resilience, security, data flow and dependency direction, and how to avoid over-engineering. Use when designing, reviewing or planning from an architecture.
---

# Architecture and design

Design to the requirements in front of you. Every element must trace to an FR/NFR (see `requirements-analysis`).

## 1. Principles and what they mean in practice
| Principle | Apply it as | Smell |
|-----------|-------------|-------|
| Separation of concerns | One component = one reason to change. Validation, state, persistence, rendering and wiring are separate modules. | A function that reads the DOM, validates, writes storage and renders |
| Single responsibility | A module's description fits in one sentence without "and" | `utils.js` that grows unrelated helpers |
| Open/closed | Extend by adding a module/strategy, not by editing a growing `if/else` | Switch on type in three places |
| Liskov | Fakes/alternatives honour the same contract (return shape, error behaviour) | A fake storage that throws where the real one returns `{success:false}` |
| Interface segregation | Components get only the capabilities they use (inject `write`, not the whole store) | Passing `window` everywhere |
| Dependency inversion | Core logic depends on small interfaces; browser/Node globals are injected at the edge (composition root) | `localStorage` read deep inside business logic |
| DRY | One owner for each rule/constant (e.g. the max title length and its message) | Same limit hard-coded in code, tests and UI |
| KISS / YAGNI | Smallest design that meets Must requirements; no speculative layers, config flags or plug-in systems | Interface with one implementation and no test seam need |

## 2. Dependency direction and data flow
- Draw dependencies pointing **inward**: UI/wiring → controller → domain/state → pure helpers. Domain code never imports UI or browser APIs.
- Show the main data flow and every failure flow (validation failure, storage read failure, storage write failure, partial data) as separate paths in the sequence diagram.
- No cycles between components. Shared state has one owner and changes through one method; others get copies/snapshots.

## 3. Choosing patterns (only when a concrete problem exists)
| Problem | Pattern | Do not use when |
|---------|---------|-----------------|
| Swap storage / API implementation, enable fakes | Adapter / dependency injection | there is only one implementation and no test need |
| Behaviour varies by policy | Strategy | two fixed cases (use `if`) |
| Create objects with several collaborators | Factory / composition root | a constructor call is enough |
| Notify several parts of a state change | Observer / event | one direct call suffices |
| Recoverable multi-step state | State machine (explicit states) | two booleans are clear enough |
Name the pattern *and* the problem it solves in the decision table; "uses Factory" without a reason is a review finding.

## 4. Modularity, reusability, maintainability
- Small modules with a narrow public surface (named exports); internal helpers not exported.
- Reuse by composing, not by copy-paste or inheritance trees.
- Component names in the architecture equal module/class names in code, so docs-sync can trace them.
- Prefer data in, data out (pure functions) for rules; side effects at the edges.

## 5. Scalability (right-sized)
State the realistic load from the requirements (e.g. hundreds of tasks in one browser). Identify the first thing that breaks (full re-render, synchronous storage) and note the cheap mitigation, but do not build for loads the story never mentions.

## 6. Error handling and resilience
- Define per failure: detection, user message (exact text), state after failure, recovery path.
- Fail atomically: do not mutate in-memory state until the persistent write succeeded.
- Never lose existing data on a failed read: block writes until recovery is confirmed.
- External calls (HTTP, GitHub): timeouts, bounded retries with backoff, idempotency for anything with side effects.
- Errors surfaced to users contain no stack traces, paths or secrets.

## 7. Security by design
- Treat all input as untrusted: validate at the boundary (type, length, charset), render with `textContent`/safe APIs, never `innerHTML`/`eval` with user data.
- Secrets only from environment/secret stores; never in code, fixtures, logs, output.
- Least privilege for tokens and file access; keep file operations inside the workspace.
- Pin and minimise dependencies; a new dependency needs a stated reason.
- Storage is user-controlled and can be tampered with: validate on load, not just on save.

## 8. Technology choices
List ≥2 options with trade-offs, pick one, tie it to requirement IDs. "We already use X and the requirement doesn't need more" is a valid rationale.

## 9. Over-engineering check (run before finalising)
- [ ] Every component maps to an FR/NFR; every FR/NFR maps to a component
- [ ] No abstraction with a single caller and no test seam need
- [ ] No configuration option nobody asked for
- [ ] No layer that only forwards calls
- [ ] Simplest alternative was considered and the reason for rejecting it is written

## 10. When reviewing a design (design-reviewer)
Use the lenses in the agent file, and for each finding cite the section and the principle above it violates, with a concrete alternative. Do not invent findings for lenses that are clean.
