---
name: testing-strategy
description: Test design guidance — positive/negative, boundary-value, equivalence partitioning, edge cases, regression, isolation, assertions, test data and reports — plus reference-only Selenium and API testing guidelines for agents that design or review such tests. Use when writing, reviewing or verifying tests.
---

# Testing strategy

This repository's stack: `node:test` + `node:assert/strict`, hermetic, no network, fakes injected at boundaries (see `tests/` and `tests/fixtures/`).

## 1. Techniques
| Technique | How to apply | Example (title length limit 255) |
|-----------|--------------|----------------------------------|
| Positive | Typical valid input succeeds with exact output | `"Complete Java revision"` is accepted unchanged |
| Negative | Invalid input is rejected with the exact message and no side effect | `""`, `"   "`, `null`, `42`, 256 chars; storage write failure leaves state unchanged |
| Boundary-value analysis | Test at, just below and just above each limit | 0, 1, 254, 255, 256 code points |
| Equivalence partitioning | One representative per class, not dozens | valid / empty / whitespace-only / over-limit / non-string |
| Edge cases | Unusual but legal | emoji (code points ≠ UTF-16 length), leading/trailing spaces, duplicate id, storage unavailable, malformed stored JSON, partial array |
| Regression | Every fixed defect gets a test that fails without the fix; run the whole suite after any change | bug about throwing `localStorage` getter → dedicated test |
| State/sequence | Order-dependent flows | blocked → reread → unblocked → save |

## 2. Independence, isolation, repeatability
- Each test creates its own state; no shared mutable fixtures, no ordering assumptions, no leaked globals (restore anything you stub).
- No network, real clock, randomness or machine paths: inject fakes (`idFactory`, storage). Use fixed ids and timestamps.
- A test passes or fails identically on every run and machine. Flaky = defect; fix the cause, never add retries/sleeps.

## 3. Assertions
- Assert exact values, shapes and messages (`assert.deepEqual(result, {valid:false, message: REQUIRED_TITLE_MESSAGE})`), and side effects (what was written, what was *not* written).
- "Does not throw" alone is not an assertion. Also assert the negative: no write happened, state unchanged.
- Import message/limit constants from source so one change does not break many tests; assert the literal at least once to pin the contract.
- One behaviour per test; name it with the requirement: `FR-4 title validation rejects empty and whitespace exactly`.

## 4. Test data
Small, explicit, fake. Builders/fixtures live in `tests/fixtures/`. Fake secret values contain `FAKE` (the hook allows them). No real tokens, emails or personal data. Data for boundaries is generated (`"a".repeat(255)`), not pasted.

## 5. Independent execution and reports
Run the project's real command (`npm test`); do not run only the tests you wrote. Report: command, pass/fail/skipped counts, failures verbatim, duration, and what was *not* run. Never edit a failing test to pass; report the defect.

## 6. Coverage thinking
Map each acceptance criterion → ≥1 test; each failure path in the code → a test; each reported defect → a regression test. Coverage numbers are a hint, not the goal; report `Not Found: coverage tool` if absent.

---
## Reference only: Selenium UI test guidelines
*These are engineering guidelines for agents that design or review browser-automation tests. This repository has no Selenium dependency and none must be added to demonstrate them.*
- **Page Object Model**: one class per page/component; locators and interactions inside it, assertions in tests.
- **Explicit waits** (`WebDriverWait` + `ExpectedConditions`) tied to a concrete condition; no `Thread.sleep()`/fixed delays; no mixing implicit and explicit waits.
- **Stable locators**: prefer `data-testid`/id/accessible name; avoid brittle absolute XPath and index-based CSS.
- **Reusable page methods** (`addTask(title)`, `getTaskTitles()`) returning data or the next page object.
- **Driver lifecycle**: create in setup, quit in teardown even on failure (try/finally or fixtures); one driver per test or thread-safe factory; headless in CI.
- **Assertions and synchronisation**: wait for the UI state, then assert; assert user-visible text/state, not implementation details.
- **Independent tests**: each test sets up and cleans its own data (e.g. clear browser storage); no dependence on test order.

## Reference only: API test guidelines
*Guidance for designing or reviewing API tests (e.g. REST Assured, `fetch`, supertest); not a dependency of this app.*
- **HTTP methods**: each endpoint only accepts its documented methods; wrong method → `405`/`404` as specified.
- **Status codes**: assert the exact code per scenario (200/201/204, 400, 401, 403, 404, 409, 422, 5xx handling).
- **Request/response validation**: required fields, types, formats, and that unknown fields are rejected or ignored as specified.
- **Headers and authentication**: `Content-Type`, `Authorization` required/forbidden cases, expired or malformed token → `401`, insufficient scope → `403`; never hard-code real tokens.
- **JSON schema validation** for response bodies, including nullability and enum values.
- **Positive and negative scenarios**: valid payloads; missing, wrong-type, oversized and malicious payloads.
- **Boundary conditions**: min/max lengths, page size limits, empty collections, large payloads.
- **Error responses**: stable error shape, meaningful message, no stack traces or secrets, correct status.
