import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { JSDOM } from 'jsdom';
import { test } from 'node:test';
import { createTaskApp, createTaskStorage } from '../app.js';
import { createAppServer } from '../server.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    }
  };
}

function createTaskPage(storage) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const boundary = createTaskStorage({ storage });
  const app = createTaskApp({ document, storageBoundary: boundary });
  return { dom, document, app };
}

function submitForm(document) {
  document.querySelector('#task-form').requestSubmit();
}

test('standalone page provides an app root and local assets', async () => {
  const document = new JSDOM(html).window.document;

  assert.ok(document.querySelector('main#app'));
  assert.equal(document.querySelector('link[rel="stylesheet"]')?.getAttribute('href'), 'styles.css');
  assert.ok(document.querySelector('script[type="module"][src="app.js"]'));
  await access(new URL('../styles.css', import.meta.url));
  await access(new URL('../app.js', import.meta.url));
});

test('HTTP server serves the page and module assets without exposing other files', async (context) => {
  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${baseUrl}/`);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  assert.match(await page.text(), /<script type="module" src="app\.js"><\/script>/);

  for (const [assetPath, contentType] of [['/app.js', /javascript/], ['/styles.css', /text\/css/]]) {
    const response = await fetch(`${baseUrl}${assetPath}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), contentType);
    assert.ok((await response.text()).length > 0);
  }

  assert.equal((await fetch(`${baseUrl}/package.json`)).status, 404);
  assert.equal((await fetch(`${baseUrl}/%2e%2e/package.json`)).status, 404);
});

test('loads existing tasks and reports success only after writing them', () => {
  const storage = createMemoryStorage();
  const taskStorage = createTaskStorage({ storage });
  const tasks = [{ title: 'Review notes', completed: false }];

  assert.deepEqual(taskStorage.load(), { tasks: [], status: 'missing' });
  assert.deepEqual(taskStorage.save(tasks), { ok: true });
  assert.deepEqual(taskStorage.load(), { tasks, status: 'loaded' });
});

test('tasks remain loadable through a fresh storage boundary after refresh', () => {
  const storage = createMemoryStorage();
  const tasks = [{ title: 'Persist this task', completed: false }];

  assert.deepEqual(createTaskStorage({ storage }).save(tasks), { ok: true });
  assert.deepEqual(createTaskStorage({ storage }).load(), { tasks, status: 'loaded' });
});

test('malformed JSON defaults to an empty list and remains detected without being overwritten', () => {
  let writeAttempted = false;
  const storage = {
    getItem: () => '{invalid json',
    setItem: () => { writeAttempted = true; }
  };
  const taskStorage = createTaskStorage({ storage });

  assert.deepEqual(taskStorage.load(), { tasks: [], status: 'malformed' });
  assert.deepEqual(taskStorage.save([{ title: 'Do not persist' }]), { ok: false, reason: 'malformed' });
  assert.equal(writeAttempted, false);
});

test('blocks loading and saving when storage is unavailable', () => {
  const taskStorage = createTaskStorage({ storage: () => { throw new Error('Storage unavailable'); } });

  assert.deepEqual(taskStorage.load(), { tasks: [], status: 'unavailable' });
  assert.deepEqual(taskStorage.save([{ title: 'Not persisted' }]), { ok: false, reason: 'unavailable' });
});

test('reports full storage when a quota error prevents writing', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new DOMException('Storage full', 'QuotaExceededError'); }
  };

  assert.deepEqual(createTaskStorage({ storage }).save([{ title: 'No space', completed: false }]), { ok: false, reason: 'full' });
});

test('reports a write failure when storage rejects the write for another reason', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('Write denied'); }
  };

  assert.deepEqual(createTaskStorage({ storage }).save([{ title: 'Write denied', completed: false }]), { ok: false, reason: 'write-failed' });
});

test('creates an incomplete task, renders it immediately, and clears input after persistence', () => {
  const storage = createMemoryStorage();
  const { document, app } = createTaskPage(storage);
  const input = document.querySelector('#task-title');
  input.value = 'Review notes';

  submitForm(document);

  assert.deepEqual(app.getTasks(), [{ title: 'Review notes', completed: false }]);
  assert.deepEqual(JSON.parse(storage.getItem('todo-app.tasks')), [{ title: 'Review notes', completed: false }]);
  assert.equal(document.querySelector('#task-list li')?.textContent, 'Review notes');
  assert.equal(input.value, '');
});

test('trims leading and trailing whitespace from a valid title', () => {
  const { document, app } = createTaskPage(createMemoryStorage());
  document.querySelector('#task-title').value = '  Review notes  ';

  submitForm(document);

  assert.deepEqual(app.getTasks(), [{ title: 'Review notes', completed: false }]);
});

test('rejects empty and whitespace-only titles with validation feedback', () => {
  for (const title of ['', ' \t ']) {
    const { document, app } = createTaskPage(createMemoryStorage());
    const input = document.querySelector('#task-title');
    input.value = title;

    submitForm(document);

    assert.deepEqual(app.getTasks(), []);
    assert.equal(document.querySelector('#form-message').textContent.length > 0, true);
    assert.equal(input.getAttribute('aria-invalid'), 'true');
    assert.equal(input.value, title);
  }
});

test('preserves the input, task list, and inline error when storage writing fails', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('Write denied'); }
  };
  const { document, app } = createTaskPage(storage);
  const input = document.querySelector('#task-title');
  input.value = 'Keep this title';

  submitForm(document);

  assert.deepEqual(app.getTasks(), []);
  assert.equal(document.querySelectorAll('#task-list li').length, 0);
  assert.equal(input.value, 'Keep this title');
  assert.equal(document.querySelector('#form-message').textContent.length > 0, true);
});

test('shows an inline error on startup for malformed data and keeps it blocked on submission', () => {
  const storage = {
    getItem: () => '{malformed',
    setItem: () => assert.fail('Malformed stored data must not be overwritten')
  };
  const { document, app } = createTaskPage(storage);
  const message = document.querySelector('#form-message');
  const input = document.querySelector('#task-title');
  const startupMessage = message.textContent;
  input.value = 'Do not overwrite stored data';

  submitForm(document);

  assert.deepEqual(app.getTasks(), []);
  assert.equal(startupMessage.length > 0, true);
  assert.equal(message.textContent.length > 0, true);
  assert.equal(input.value, 'Do not overwrite stored data');
});

test('corrupted stored data defaults to an empty list and blocks writes and creation', () => {
  const cases = [
    { name: 'invalid JSON', raw: '{malformed', status: 'malformed' },
    { name: 'object root', raw: '{"tasks":[]}', status: 'corrupted' },
    { name: 'null entry', raw: '[null]', status: 'corrupted' },
    { name: 'missing title', raw: '[{"completed":false}]', status: 'corrupted' },
    { name: 'non-string title', raw: '[{"title":1,"completed":false}]', status: 'corrupted' },
    { name: 'non-boolean completed', raw: '[{"title":"Review notes","completed":"false"}]', status: 'corrupted' }
  ];

  for (const { name, raw, status } of cases) {
    let writeCount = 0;
    const storage = {
      getItem: () => raw,
      setItem: () => { writeCount += 1; }
    };
    const boundary = createTaskStorage({ storage });
    const loaded = boundary.load();
    const saveResult = boundary.save([{ title: 'Do not overwrite', completed: false }]);
    const { document, app } = createTaskPage(storage);
    const input = document.querySelector('#task-title');
    const message = document.querySelector('#form-message');
    input.value = 'Keep this title';

    submitForm(document);

    assert.deepEqual(loaded.tasks, [], `${name}: read fallback`);
    assert.equal(loaded.status, status, `${name}: detectable corruption`);
    assert.deepEqual(saveResult, { ok: false, reason: status }, `${name}: save blocked`);
    assert.deepEqual(app.getTasks(), [], `${name}: create blocked`);
    assert.equal(message.textContent.length > 0, true, `${name}: inline error`);
    assert.equal(input.value, 'Keep this title', `${name}: input preserved`);
    assert.equal(writeCount, 0, `${name}: setItem not called`);
    assert.equal(storage.getItem('todo-app.tasks'), raw, `${name}: raw value unchanged`);
  }
});

test('uses accessible native form controls and supports form submission', () => {
  const { document, app } = createTaskPage(createMemoryStorage());
  const input = document.querySelector('#task-title');
  const form = document.querySelector('#task-form');

  assert.equal(document.querySelector('label[for="task-title"]')?.textContent, 'Task title');
  assert.equal(form.querySelector('button[type="submit"]')?.textContent, 'Add Task');
  assert.equal(input.getAttribute('aria-describedby'), 'form-message');
  input.value = 'Submit from the form';
  form.requestSubmit();

  assert.deepEqual(app.getTasks(), [{ title: 'Submit from the form', completed: false }]);
});

test('renders a task title as text rather than markup', () => {
  const { document } = createTaskPage(createMemoryStorage());
  const title = '<img src=x onerror=alert(1)>';
  document.querySelector('#task-title').value = title;

  submitForm(document);

  assert.equal(document.querySelector('#task-list li')?.textContent, title);
  assert.equal(document.querySelector('#task-list img'), null);
});