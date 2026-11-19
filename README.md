# Browser TODO

A browser-only TODO app for creating tasks, showing them as incomplete, and
restoring saved tasks from browser storage. The app has no backend and requires
no application credentials or environment variables.

## Run locally

The app uses JavaScript modules, so serve `src/` over HTTP rather than opening
the HTML file directly. From the repository root, run:

```sh
python -m http.server 8000 --directory src
```

Then open <http://localhost:8000/> in a JavaScript-enabled browser with browser
storage available. The static server serves the page and its imported JavaScript
modules; this launch path was verified against the app.

To stop the server, press `Ctrl+C` in its terminal.

## Use

1. Enter a task title and select **Add Task**.
2. Empty or whitespace-only titles are rejected. Titles longer than 255 Unicode
   code points are also rejected; accepted title text is preserved as entered.
3. After a successful save, the task appears in the list as **incomplete**, and
   the input is cleared.
4. Tasks are stored in this browser's `localStorage` for this site origin and
   are restored when the page is refreshed.

If saved data cannot be read, the app shows a recovery message and blocks task
creation rather than overwriting the data. Use **Reread saved tasks** to retry
reading it. Alternatively, **Replace saved tasks** asks for explicit
confirmation; confirming releases the write block, and a later successful task
save can replace the unreadable data. **Replace saved tasks** is available only
while the app is blocked after an unreadable initial load; it is hidden and
disabled when data is readable, after a successful reread, or after confirmed
replacement. A failed save leaves the task list and input unchanged and
displays an error.

Storage is browser- and origin-specific. Clearing site data, changing browser
or origin, or browser privacy, quota, or policy restrictions may make saved
tasks unavailable. This app does not synchronize tasks between devices or tabs.
There is no server-side storage.

## Configuration

No environment variables are required by the application. `.env.example` records
that no variables are required. The test suite also supports optional
`BROWSER_BIN` to identify a Chrome or Edge executable when it is not found in a
standard location.

## Tests

Node.js 20 or newer is required. Run the tests from the repository root:

```sh
npm test
```

The browser acceptance test requires an installed Chrome or Edge browser.

## Project structure

- `src/` — app page, styles, task creation, validation, rendering, storage, and
  recovery code.
- `tests/` — unit, integration, storage fault, security, and browser acceptance
  tests.
- `docs/` — approved requirements and architecture, implementation plan, design
  review, and traceability documentation.
- `package.json` — Node version requirement and test command.
- `.env.example` — application environment-variable note.

See the [documentation directory](docs/) and the
[approved requirements](docs/requirements.md),
[architecture](docs/architecture.md), and
[implementation plan](docs/impl-plan.md).
