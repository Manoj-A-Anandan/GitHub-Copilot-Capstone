'use strict';

const TASKS_STORAGE_KEY = 'todo-app.tasks';

const storageErrorMessage = 'The task could not be saved. Please try again.';
const malformedStorageMessage = 'Stored tasks could not be read, so this task was not added.';

function isValidTaskList(tasks) {
	return Array.isArray(tasks) && tasks.every((task) =>
		task !== null && typeof task === 'object' && !Array.isArray(task) &&
		typeof task.title === 'string' && typeof task.completed === 'boolean'
	);
}

export function createTaskStorage({ storage = () => globalThis.localStorage, key = TASKS_STORAGE_KEY } = {}) {
	function load() {
		let store;
		let raw;

		try {
			store = typeof storage === 'function' ? storage() : storage;
			if (!store || typeof store.getItem !== 'function') {
				return { tasks: [], status: 'unavailable' };
			}
			raw = store.getItem(key);
		} catch {
			return { tasks: [], status: 'unavailable' };
		}

		if (raw === null) {
			return { tasks: [], status: 'missing' };
		}

		try {
			const tasks = JSON.parse(raw);
			return isValidTaskList(tasks)
				? { tasks, status: 'loaded' }
				: { tasks: [], status: 'corrupted' };
		} catch {
			return { tasks: [], status: 'malformed' };
		}
	}

	function save(tasks) {
		const current = load();
		if (current.status === 'unavailable' || current.status === 'malformed' || current.status === 'corrupted') {
			return { ok: false, reason: current.status };
		}
		if (!isValidTaskList(tasks)) {
			return { ok: false, reason: 'invalid' };
		}

		try {
			const store = typeof storage === 'function' ? storage() : storage;
			store.setItem(key, JSON.stringify(tasks));
			return { ok: true };
		} catch (error) {
			return {
				ok: false,
				reason: error?.name === 'QuotaExceededError' ? 'full' : 'write-failed'
			};
		}
	}

	return { load, save };
}

export const taskStorage = createTaskStorage();
export const initialTaskState = taskStorage.load();

export function createTaskApp({ document = globalThis.document, storageBoundary = taskStorage, initialState = storageBoundary.load() } = {}) {
	const form = document.querySelector('#task-form');
	const titleInput = document.querySelector('#task-title');
	const taskList = document.querySelector('#task-list');
	const message = document.querySelector('#form-message');
	let tasks = Array.isArray(initialState.tasks) ? initialState.tasks : [];

	function showMessage(text, invalid = false) {
		message.textContent = text;
		titleInput.setAttribute('aria-invalid', String(invalid));
	}

	function renderTasks() {
		taskList.replaceChildren();
		for (const task of tasks) {
			const item = document.createElement('li');
			item.textContent = task.title;
			taskList.append(item);
		}
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		showMessage('');

		const title = titleInput.value.trim();
		if (!title) {
			showMessage('Enter a task title.', true);
			return;
		}

		const nextTasks = [...tasks, { title, completed: false }];
		const result = storageBoundary.save(nextTasks);
		if (!result.ok) {
			showMessage(result.reason === 'malformed' || result.reason === 'corrupted'
				? malformedStorageMessage
				: storageErrorMessage);
			return;
		}

		tasks = nextTasks;
		renderTasks();
		titleInput.value = '';
	});

	renderTasks();
	if (initialState.status === 'malformed' || initialState.status === 'corrupted') {
		showMessage(malformedStorageMessage);
	}

	return { getTasks: () => [...tasks] };
}

if (typeof document !== 'undefined') {
	createTaskApp({ document, initialState: initialTaskState });
}