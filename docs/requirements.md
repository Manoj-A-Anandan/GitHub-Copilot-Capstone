# Requirements — Create a TODO Task

Source: user-story/_extracted.md (source: user-story-create-todo-task.md)   Version: 3   Status: Draft

## 1. User Story

As a TODO application user,

I want to create a task by entering a task title,

So that I can keep track of the activities I need to complete.

### Extracted Acceptance Criteria

**Scenario 1: Successfully Create a Task**

**Given** I am on the TODO application page

**When** I enter "Complete Java revision" in the task input field

**And** I click the Add Task button

**Then** the task "Complete Java revision" should appear in the task list

**And** the task should have an incomplete status.

**Scenario 2: Prevent Empty Task Creation**

**Given** I am on the TODO application page

**When** I leave the task input field empty

**And** I click the Add Task button

**Then** the application should not create a task

**And** an appropriate validation message should be displayed.

**Scenario 3: Prevent Whitespace-Only Task Creation**

**Given** I am on the TODO application page

**When** I enter only whitespace in the task input field

**And** I click the Add Task button

**Then** the application should not create a task

**And** an appropriate validation message should be displayed.

**Scenario 4: Clear Input After Task Creation**

**Given** I am on the TODO application page

**When** I enter a valid task title

**And** I click the Add Task button

**Then** the task should be added successfully

**And** the input field should be cleared.

**Scenario 5: Persist Tasks After Browser Refresh**

**Given** I have successfully created a task

**When** I refresh the browser

**Then** the previously created task should still appear in the task list.

## 2. Scope

In scope:
- Entry of a single task title.
- Creation of a task through an Add Task action.
- Validation of empty and whitespace-only titles.
- Display of newly created tasks with an incomplete status.
- Clearing the title input after successful creation.
- Local browser persistence and restoration of created tasks after refresh.

Out of scope:
- Editing existing tasks
- Deleting tasks
- Marking tasks as completed
- Task due dates and reminders
- User authentication
- Server-side database integration

## 3. Functional Requirements

| ID | Requirement | Priority (MoSCoW) | Acceptance criteria (Given/When/Then) |
|----|-------------|-------------------|----------------------------------------|
| FR-1 | The application shall provide an input field for entering a task title. | Must | Given the TODO application page is displayed, When the page loads, Then a task-title input field shall be available. |
| FR-2 | The application shall provide an Add Task button. | Must | Given the TODO application page is displayed, When the page loads, Then an Add Task button shall be available. |
| FR-3 | The application shall create a task when a valid task title is entered and the Add Task button is activated. | Must | Given a valid task title is entered, When the Add Task button is clicked, Then one task shall be created using the entered title. |
| FR-4 | The application shall reject a task title that is empty or contains only whitespace and display `Task title is required and cannot be empty.` | Must | Given the title input is empty or contains only whitespace, When Add Task is activated, Then no task shall be created and the exact message `Task title is required and cannot be empty.` shall be displayed. |
| FR-5 | A newly created task shall appear in the task list in the same user interaction that creates it. | Must | Given a valid task title is entered, When Add Task is activated successfully, Then the task shall be visible in the task list without a manual refresh or page reload. |
| FR-6 | Every newly created task shall have an incomplete status by default. | Must | Given a valid task is created, When the task appears in the task list, Then its status shall be incomplete. |
| FR-7 | The application shall clear the task-title input after successful task creation. | Must | Given a valid task has been created, When creation succeeds, Then the task-title input shall contain no text. |
| FR-8 | The application shall save created tasks in browser local storage. | Must | Given a valid task is created and storage is writable, When creation succeeds, Then the task shall be represented in browser local storage. If the write fails, Then no task shall be added and the exact message `Unable to save the task. Please try again.` shall be displayed. |
| FR-9 | The application shall restore previously saved tasks after the browser is refreshed. | Must | Given at least one task was previously created successfully, When the browser page is refreshed, Then each previously saved task shall appear in the task list. |
| FR-10 | The application shall reject task titles longer than 255 Unicode code points and display `Task title must be 255 characters or fewer.` | Must | Given a title contains more than 255 Unicode code points, When Add Task is activated, Then no task shall be created and the exact message `Task title must be 255 characters or fewer.` shall be displayed. |

## 4. Non-Functional Requirements

| ID | Category (security, performance, reliability, usability, maintainability, portability) | Requirement | Measurable target |
|----|----|----|----|
| NFR-1 | Security | The application shall treat task titles as untrusted input and shall not execute or interpret title text as executable content. | 100% of tested HTML/script-like title inputs shall be rendered as text and shall not execute any script. |
| NFR-2 | Usability | The interface shall provide the exact required validation feedback immediately when task creation is attempted with an invalid title. | Within the same interaction: an empty or whitespace-only title shall display `Task title is required and cannot be empty.`; a title over 255 Unicode code points shall display `Task title must be 255 characters or fewer.` |
| NFR-3 | Usability | The application shall provide immediately visible feedback after successful task creation. | The created task shall be visible and the input shall be cleared within the same user interaction that activates Add Task. |
| NFR-4 | Portability | The application shall support desktop and mobile layouts. | All create-task controls shall remain visible and operable in a 320-pixel-wide portrait viewport and a 1280-pixel-wide desktop viewport. |
| NFR-5 | Reliability | Created tasks shall remain available across normal browser refreshes. | 100% of successfully created tasks shall be restored after 1 browser refresh under supported browser storage conditions. |
| NFR-6 | Reliability / Error handling | The application shall handle absent, partially malformed, unreadable, and unwritable browser task data without crashing or silently overwriting data. An unreadable initial load shall produce zero loaded tasks, display `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.`, and block task writes until a successful read or explicit user-confirmed replacement. Partially malformed arrays shall retain valid distinct records. A failed write shall be atomic and shall display `Unable to save the task. Please try again.` | Tests shall verify: absent data loads zero tasks; partially malformed arrays retain all valid distinct records; an unreadable initial load loads zero tasks, shows the exact unreadable-load message, and prevents writes until successful reread or explicit user-confirmed replacement; a failed write leaves stored data unchanged and shows the exact failed-save message; and no storage-error condition shall crash. |
| NFR-7 | Testability | Successful creation, validation failures, input clearing, default status, persistence, and refresh restoration shall be independently verifiable. | Automated or repeatable tests shall cover each FR acceptance scenario and verify its observable result. |
| NFR-8 | Security | The browser-only task-creation flow shall not require, generate, or persist application credentials or secrets. | 0 application credentials or secrets required, generated, or persisted, verified by inspection and tests. |

## 5. Data & Interfaces

Inputs:
- One user-entered task title as text.
- Activation of the Add Task control.
- Task titles shall contain no more than 255 Unicode code points.

Outputs:
- A task list entry containing the task title and an incomplete status.
- A validation message for empty or whitespace-only titles.
- Validation feedback for titles exceeding the maximum length.
- A cleared task-title input after successful creation.

External systems/APIs:
- Browser local storage only.
- No backend or external database.

Formats:
- Titles shall be handled as text.
- Storage format is not prescribed by this story.

Missing-data rule:
- If no saved task data exists, the task list shall be empty.
- No lookup feature is in scope. If a lookup feature is introduced in a later scope, a missing lookup result shall render `Not Found`; this rule does not require rendering `Not Found` for a persisted record in this create-only scope.
- For partially malformed stored arrays, valid distinct task records shall be preserved. If the initial storage load is unreadable, zero tasks shall be loaded, the exact message `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.` shall be shown, and task writes shall remain blocked until a successful read or explicit user-confirmed replacement. Failed writes shall be atomic and shall show the exact message `Unable to save the task. Please try again.`

## 6. Assumptions

- The application is a local, single-user TODO application.
- The browser supports JavaScript and browser local storage.
- A browser refresh is the normal persistence trigger and does not clear application origin storage.
- “Immediate” means that the task list and validation feedback update during the same user interaction, without navigation or manual page reload.
- The maximum title length is 255 Unicode code points, as clarified by the human.
- The 320-pixel and 1280-pixel layout targets are test widths for the responsive requirement.

## 7. Constraints

- Task data shall be stored locally in the browser.
- No server-side database or external data service shall be used.
- Editing, deleting, completion, due dates, reminders, and authentication are outside the implementation scope.

## 8. Open Items

None.

## 9. Clarification Log

| # | Question | Answer | Answered by | Date |
|----|----------|--------|-------------|------|
| 1 | What exact validation message applies to empty and whitespace-only titles? | `Task title is required and cannot be empty.` | Human | 2026-11-19 |
| 2 | What is the maximum title length and how is it counted? | 255 Unicode code points. | Human | 2026-11-19 |
| 3 | What storage recovery behavior is required? | Load zero tasks when data is unreadable; preserve valid distinct records in partially malformed arrays; fail writes atomically; show a clear storage error. | Human | 2026-11-19 |
| 4 | After an unreadable initial storage load, may task writes proceed? | Block task writes until a successful read or explicit user-confirmed replacement. | Human | 2026-11-19 |
| 5 | Is lookup or `Not Found` behavior part of the current create-only scope? | No lookup feature exists in current scope. `Not Found` applies conditionally only if a lookup feature is introduced later. | Human | 2026-11-19 |
| 6 | Should the previously approved requirements be reopened to record the decisions? | Yes; reopen requirements to record all decisions and make `Not Found` conditional. Obtain G1 approval before revising architecture or rerunning design review. | Human | 2026-11-19 |
| 7 | What exact validation message shall be displayed for a title over 255 Unicode code points? | `Task title must be 255 characters or fewer.` | Human | 2026-11-19 |
| 8 | What exact message shall be displayed when the initial task load is unreadable? | `Saved tasks could not be read. Resolve the issue or confirm replacing saved tasks before adding a task.` | Human | 2026-11-19 |
| 9 | What exact message shall be displayed when saving a task fails? | `Unable to save the task. Please try again.` | Human | 2026-11-19 |

## 10. Revision History

| Version | Date | Change |
|---------|------|--------|
| 1 | 2026-11-19 | Previously approved requirements baseline. |
| 2 | 2026-11-19 | Revised on the human's explicit reopen request (DR-3) to record the G2 clarifications and DR-1/DR-2 decisions; updated obsolete assumptions and open items. |
| 3 | 2026-11-19 | Completed the partial Version 2 wording revision by recording the exact overlength, unreadable-load, and failed-save messages; removed the resolved open items. |
