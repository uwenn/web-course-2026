
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

import TodoForm from './components/TodoForm.jsx';
import Filters from './components/Filters.jsx';
import Stats from './components/Stats.jsx';
import TodoList from './components/TodoList.jsx';

const API_URL = 'http://localhost:3001';
const STORAGE_KEY = 'todos';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'alphabet', label: 'Alphabetical (A–Z)' },
];

function readTodosFromStorage() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);
    if (!Array.isArray(parsedTodos)) return [];

    return parsedTodos.filter(
      (todo) =>
        todo &&
        (typeof todo.id === 'number' || typeof todo.id === 'string') &&
        typeof todo.text === 'string' &&
        typeof todo.completed === 'boolean'
    );
  } catch (error) {
    console.error('Could not read tasks from localStorage:', error);
    return [];
  }
}

async function requestTodos(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

export default function App() {
  const [todos, setTodos] = useState(readTodosFromStorage);
  const [allTodos, setAllTodos] = useState(readTodosFromStorage);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshData = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (filter === 'active') params.set('completed', 'false');
    if (filter === 'completed') params.set('completed', 'true');

    if (sort === 'alphabet') {
      params.set('_sort', 'text');
      params.set('_order', 'asc');
    } else {
      params.set('_sort', 'createdAt');
      params.set('_order', sort === 'oldest' ? 'asc' : 'desc');
    }

    const query = params.toString();
    const listUrl = `${API_URL}/todos${query ? `?${query}` : ''}`;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [visibleTodos, completeList] = await Promise.all([
          requestTodos(listUrl, { signal: controller.signal }),
          requestTodos(`${API_URL}/todos`, { signal: controller.signal }),
        ]);

        if (!controller.signal.aborted) {
          setTodos(visibleTodos);
          setAllTodos(completeList);
          setLoading(false);
        }
      } catch (loadError) {
        if (loadError.name !== 'AbortError' && !controller.signal.aborted) {
          setError(
            'Could not connect to JSON Server. Make sure the server is running on port 3001.'
          );
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [filter, sort, refreshVersion]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTodos));
    } catch (storageError) {
      console.error('Could not save tasks to localStorage:', storageError);
    }
  }, [allTodos]);

  const addTodo = useCallback(async (text, type) => {
    setBusy(true);
    setError('');
    setNotice('');

    try {
      await requestTodos(`${API_URL}/todos`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          completed: type === 'done',
          createdAt: Date.now(),
        }),
      });

      refreshData();
    } catch (requestError) {
      setError(`Could not add task: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }, [refreshData]);

  const toggleTodo = useCallback(async (id, completed) => {
    setBusy(true);
    setError('');

    try {
      await requestTodos(`${API_URL}/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: !completed }),
      });

      refreshData();
    } catch (requestError) {
      setError(`Could not update task: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }, [refreshData]);

  const deleteTodo = useCallback(async (id) => {
    setBusy(true);
    setError('');

    try {
      await requestTodos(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
      });

      refreshData();
    } catch (requestError) {
      setError(`Could not delete task: ${requestError.message}`);
    } finally {
      setBusy(false);
    }
  }, [refreshData]);

  const importSampleTodos = useCallback(async () => {
    setImporting(true);
    setError('');
    setNotice('');

    try {
      const externalTodos = await requestTodos(
        'https://jsonplaceholder.typicode.com/todos?_limit=5'
      );

      await Promise.all(
        externalTodos.map((todo, index) =>
          requestTodos(`${API_URL}/todos`, {
            method: 'POST',
            body: JSON.stringify({
              text: todo.title,
              completed: todo.completed,
              createdAt: Date.now() + index,
            }),
          })
        )
      );

      setNotice(
        `Imported ${externalTodos.length} sample tasks from JSONPlaceholder.`
      );

      refreshData();
    } catch (requestError) {
      setError(`Could not import sample tasks: ${requestError.message}`);
    } finally {
      setImporting(false);
    }
  }, [refreshData]);

  const stats = useMemo(() => {
    const completed = allTodos.filter((todo) => todo.completed).length;
    const active = allTodos.length - completed;

    return {
      total: allTodos.length,
      active,
      completed,
      counts: {
        all: allTodos.length,
        active,
        completed,
      },
    };
  }, [allTodos]);

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <div className="app">
        <header className="header">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="brand-name">
              task<span>.</span>
            </span>
          </div>

          <div className="header-note">
            <span className="header-note-dot" />
            Task manager
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>
              Your tasks,
              <br />
              <span>organized.</span>
            </h1>
            <p className="welcome-description">
              Keep track of what matters and make progress one task at a time.
            </p>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <span className="art-sun">✳</span>
            <span className="art-sparkle">✦</span>
            <span className="art-circle" />
          </div>
        </section>

        <TodoForm onAdd={addTodo} disabled={busy || loading} />

        <Stats
          total={stats.total}
          active={stats.active}
          completed={stats.completed}
        />

        <section className="tasks-section" aria-labelledby="tasks-heading">
          <div className="tasks-heading-row">
            <div>
              <p className="section-kicker">OVERVIEW</p>
              <h2 id="tasks-heading">
                Task list <span>{stats.total}</span>
              </h2>
            </div>

            <div className="sort-wrapper">
              <label htmlFor="todo-sort">Sort by</label>
              <select
                id="todo-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="toolbar">
            <Filters
              currentFilter={filter}
              onFilterChange={setFilter}
              counts={stats.counts}
            />

            <button
              className="import-button"
              type="button"
              onClick={importSampleTodos}
              disabled={importing || busy || loading}
            >
              {importing ? 'Importing...' : '↓ Import sample tasks'}
            </button>
          </div>

          {error && (
            <p className="app-message app-message--error" role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p className="app-message app-message--success" role="status">
              {notice}
            </p>
          )}

          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            disabled={busy || loading}
            loading={loading}
          />
        </section>

        <footer className="footer">
          <span>Tasks are stored in your local JSON database</span>
        </footer>
      </div>
    </main>
  );
}
