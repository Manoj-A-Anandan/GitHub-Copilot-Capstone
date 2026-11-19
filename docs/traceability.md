# Traceability Matrix

Source: `docs/requirements.md` (v3)  
Architecture: `docs/architecture.md` (v3; rebased on requirements v3)  
Design review: `docs/design-review.md` (Round 1 findings retained; Round 2 resolves DR-1, DR-2, and DR-3)  
Plan: Not Found
Code: Not Found
Tests: Not Found
Upstream: `user-story/_extracted.md` (source: `user-story-create-todo-task.md`)

| Requirement ID | Architecture component | Plan task(s) | Code file(s) | Test(s) | Status |
|---|---|---|---|---|---|
| FR-1 | Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-2 | Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-3 | Task Creation Controller; Title Validator; In-Memory Task State; Local Storage Adapter | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-4 | Title Validator; Feedback Display; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; exact empty/whitespace message retained: `Task title is required and cannot be empty.` |
| FR-5 | Task Creation Controller; In-Memory Task State; Task List Renderer; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-6 | In-Memory Task State; Task List Renderer | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-7 | Task Creation Controller; Task Page UI; Feedback Display | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-8 | Task Creation Controller; In-Memory Task State; Local Storage Adapter; Feedback Display | Not Found | Not Found | Not Found | Architecture mapped; save-first atomic write and exact failed-save message retained: `Unable to save the task. Please try again.`; DR-1 write gate resolved in Round 2 |
| FR-9 | Local Storage Adapter; In-Memory Task State; Task List Renderer | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-10 | Title Validator; Task Creation Controller; Feedback Display | Not Found | Not Found | Not Found | Architecture mapped; 255-Unicode-code-point limit and exact overlength message retained |
| NFR-1 | Task List Renderer; Title Validator | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-2 | Title Validator; Feedback Display; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; exact required and overlength validation strings retained |
| NFR-3 | Task Creation Controller; Task List Renderer; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-4 | Task Page UI; Responsive Layout | Not Found | Not Found | Not Found | Architecture mapped; 320-pixel and 1280-pixel targets are mapped |
| NFR-5 | Local Storage Adapter; In-Memory Task State | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-6 | Local Storage Adapter; Storage Recovery State; Task Creation Controller; In-Memory Task State; Feedback Display | Not Found | Not Found | Not Found | Architecture mapped; unreadable-load write gate and partial recovery retained; exact unreadable-load message: `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.`; exact failed-write message: `Unable to save the task. Please try again.`; DR-1 resolved in Round 2 |
| NFR-7 | Testing Strategy; Task Creation Controller; Title Validator; Storage Recovery State; Local Storage Adapter; Task List Renderer | Not Found | Not Found | Not Found | Architecture test strategy mapped; no implementation test artifacts exist |
| NFR-8 | Browser-only flow; no credentials or external services | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |

## Design-review disposition

| Finding | Round 1 disposition | Round 2 disposition | Architecture v3 evidence |
|---|---|---|---|
| DR-1 | Open — unreadable-load writes could overwrite unknown stored data | Resolved — writes are blocked until successful reread or explicit confirmed replacement | `docs/architecture.md` §2 (Read/write recovery), §4 (Storage Recovery State), §5, §7, §9, §11 |
| DR-2 | Open — missing-data/`Not Found` lookup scope was ambiguous | Resolved — no lookup feature is in scope; `Not Found` applies only if lookup is introduced later | `docs/architecture.md` §5 (DR-2), §6, §9 |
| DR-3 | Accepted risk pending reconciliation — requirements v2 and architecture v2 used different acceptance text | Resolved — requirements v3 is the authority and architecture v3 is rebased consistently | `docs/architecture.md` §5, §7, §9, §13 |
