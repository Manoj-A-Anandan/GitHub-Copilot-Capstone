---
name: requirements-analysis
description: Techniques for turning a user story into complete, consistent, testable requirements — completeness/consistency/ambiguity checks, FR vs NFR, feasibility, Given/When/Then with positive, negative and boundary scenarios, edge cases, traceability, and clarification handling. Use in the requirements stage and when checking traceability.
---

# Requirements analysis

## 1. Decompose the story
Extract: actor, goal, trigger, inputs, outputs, data stored, constraints, implied behaviour. One sentence of the story often hides several requirements ("add a task and see it after refresh" = create + persist + restore).

## 2. Functional vs non-functional
- **FR**: observable behaviour ("The system shall reject a title that is empty after trimming").
- **NFR**, by category, each with a *measurable* target: security (no `innerHTML` with user text; no secrets), reliability (storage failure never loses existing data), performance (e.g. list renders < 100 ms for 1,000 tasks), usability (error shown next to the input), maintainability, portability (supported browsers/Node version), testability (every FR runnable without network).
- Use "shall", one behaviour per requirement. Split "and"/"or" sentences.

## 3. Completeness checklist
For every input: valid, empty, whitespace-only, too long, wrong type, duplicate, special characters/Unicode. For every action: success, failure, partial failure, repeat (idempotency). For every stored thing: first run (nothing stored), corrupt data, quota/permission errors. Also: who sees the error and what exact text; what happens to the UI state after failure; out-of-scope list.

## 4. Consistency and contradiction detection
- Same term, same meaning everywhere (task vs todo vs item). Build a glossary if two words appear.
- Compare every pair of requirements touching the same data: do limits agree (255 vs 256)? do messages match? does one say "clear the input" while another says "keep it on error"?
- Check priorities: a `Must` requirement cannot depend on a `Won't`.
- Check story acceptance criteria against derived FRs. A derived FR that contradicts a source criterion is a question for the human, never a silent override.

## 5. Ambiguity detection
Flag and quantify: "fast", "user-friendly", "appropriate", "etc.", "as needed", "should", "some", unspecified units (characters vs bytes vs code points), unspecified order, "and/or", passive voice with no actor. Each flag becomes a measurable requirement or an `OPEN QUESTION` with a suggested default.

## 6. Feasibility and testability
- Feasible: fits the existing stack and constraints (browser-only app → no server validation, no database). If not, raise it, do not drop it.
- Testable: you can name the input, the action and an exact expected result. "Handles errors gracefully" is not testable; "shows `Unable to save the task. Please try again.` and keeps the typed title" is.

## 7. Acceptance criteria: Given / When / Then
```
Given an empty task list and a title of exactly 255 code points
When the user selects Add Task
Then the task is saved, shown as incomplete, and the input is cleared
```
For each FR write at least:
| Scenario type | Example |
|---------------|---------|
| Positive | typical valid title |
| Negative | empty, whitespace-only, 256 chars, storage write failure |
| Boundary | length 0, 1, 254, 255, 256; first and second item |
| Edge | emoji / combining characters, leading-trailing spaces preserved?, double click, rapid repeat, unreadable stored data, duplicate id |
One Then clause = one observable outcome; avoid "and" chains that hide two checks.

## 8. Traceability
Stable IDs (`FR-n`, `NFR-n`, never renumbered; withdrawn items struck through). Every FR/NFR must be traceable forward: requirement → architecture component → plan task → code file → test. Every acceptance scenario gets a test ID later. A requirement with no downstream link, or a component with no requirement (gold plating), is a defect.

## 9. Missing information and clarification handling
- Do not guess. If a gap changes design or tests, return `OPEN QUESTIONS`: numbered, each with a suggested default, grouped, max ~10.
- Non-blocking gaps become entries in **Assumptions** (with owner to confirm) and **Open Items**.
- Record every answer in the Clarification Log with who answered and when. Re-run the consistency check after answers arrive.
- Never fill a gap from general knowledge of "how apps usually work" without recording it as an assumption.

## 10. Self-check before returning
- [ ] Every FR has ≥1 positive, ≥1 negative, and boundary scenarios where a limit exists
- [ ] Every NFR has a number or an observable pass condition
- [ ] No ambiguous words left unquantified
- [ ] No two requirements contradict; terms are consistent
- [ ] Out-of-scope stated; assumptions and open items listed
- [ ] IDs unique and stable
