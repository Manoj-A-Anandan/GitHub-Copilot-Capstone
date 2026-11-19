# Traceability Matrix

Source: `docs/requirements.md` (v3)  
Architecture: `docs/architecture.md` (v2; still based on requirements v1)  
Design review: `docs/design-review.md` (Round 1; DR-1 and DR-2 remain Open in the review text)  
Plan: Not Found
Code: Not Found
Tests: Not Found
Upstream: `user-story/_extracted.md` (source: `user-story-create-todo-task.md`)

| Requirement ID | Architecture component | Plan task(s) | Code file(s) | Test(s) | Status |
|---|---|---|---|---|---|
| FR-1 | Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-2 | Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-3 | Task Creation Controller; Title Validator; In-Memory Task State; Local Storage Adapter | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-4 | Title Validator; Validation and Storage Feedback; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending; exact required message must be retained |
| FR-5 | Task Creation Controller; In-Memory Task State; Task List Renderer; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-6 | In-Memory Task State; Task List Renderer | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-7 | Task Creation Controller; Task Page UI; Validation and Storage Feedback | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-8 | Task Creation Controller; In-Memory Task State; Local Storage Adapter | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending; exact failed-save message and atomic-write behavior are unresolved in architecture |
| FR-9 | Local Storage Adapter; In-Memory Task State; Task List Renderer | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| FR-10 | Title Validator; Task Creation Controller; Validation and Storage Feedback | Not Found | Not Found | Not Found | Architecture mapped; exact 255-code-point limit and exact overlength message are unresolved because architecture says “clear feedback” rather than the required literal message |
| NFR-1 | Task List Renderer; Title Validator | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-2 | Title Validator; Validation and Storage Feedback; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; exact required/overlength validation strings are unresolved in architecture |
| NFR-3 | Task Creation Controller; Task List Renderer; Task Page UI | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-4 | Task Page UI; Responsive Layout | Not Found | Not Found | Not Found | Architecture mapped; 320-pixel and 1280-pixel targets are mapped |
| NFR-5 | Local Storage Adapter; In-Memory Task State | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
| NFR-6 | Local Storage Adapter; Task Creation Controller; In-Memory Task State; Validation and Storage Feedback | Not Found | Not Found | Not Found | Architecture partially mapped; unresolved read-error write gate and exact unreadable-load/failed-save messages |
| NFR-7 | Testing Strategy; Task Creation Controller; Title Validator; Local Storage Adapter; Task List Renderer | Not Found | Not Found | Not Found | Architecture test strategy mapped; no implementation test artifacts exist |
| NFR-8 | Browser-only flow; no credentials or external services | Not Found | Not Found | Not Found | Architecture mapped; downstream implementation pending |
