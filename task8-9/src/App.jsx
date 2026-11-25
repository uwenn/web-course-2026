import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001';
const STORAGE_KEY = 'todos';

const FILTERS = [
  { id: 'all', label: 'All tasks' },
  { id: 'active', label: 'To do' },
  { id: 'completed', label: 'Completed' },
];

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

function formatDate(timestamp) {
  if (!timestamp) return 'Date unavailable';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function TodoForm({ onAdd, disabled }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('pending');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText || disabled) return;

    await onAdd(trimmedText, type);
    setText('');
    setType('pending');
  };

  return (
    <section className="composer-card" aria-labelledby="composer-title">
      <div className="section-kicker">NEW TASK</div>
      <h2 className="composer-title" id="composer-title">
        What needs to get done?
      </h2>

      <form className="form-panel" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="todo-text">Task title</label>
        <input
          id="todo-text"
          className="todo-input"
          type="text"
          placeholder="e.g. Prepare the project presentation..."
          value={text}
          maxLength={140}
          onChange={(event) => setText(event.target.value)}
          required
        />

        <label className="sr-only" htmlFor="todo-initial-status">Initial task status</label>
        <select
          id="todo-initial-status"
          className="status-select"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="pending">To do</option>
          <option value="done">Completed</option>
        </select>

        <button className="add-button" type="submit" disabled={disabled || !text.trim()}>
          <span aria-hidden="true">＋</span>
          Add task
        </button>
      </form>

      <div className="composer-footer">
        <p className="form-hint">Press Enter to add a task</p>
        <span className="character-count">{text.length}/140</span>
      </div>
    </section>
  );
}

const Filters = memo(function Filters({ currentFilter, onFilterChange, counts }) {
  return (
    <div className="filters" role="group" aria-label="Filter tasks">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`filter-btn ${currentFilter === filter.id ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.id)}
          aria-pressed={currentFilter === filter.id}
        >
          {filter.label}
          <span className="filter-count">{counts[filter.id]}</span>
        </button>
      ))}
    </div>
  );
});

const Stats = memo(function Stats({ total, active, completed }) {
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="stats" aria-label="Task statistics">
      <article className="stat-card stat-card--violet">
        <div className="stat-topline">
          <span className="stat-icon" aria-hidden="true">✳</span>
          <span className="stat-label">Total tasks</span>
        </div>
        <strong className="stat-value">{total}</strong>
        <span className="stat-caption">All tasks in your list</span>
      </article>

      <article className="stat-card stat-card--peach">
        <div className="stat-topline">
          <span className="stat-icon" aria-hidden="true">◷</span>
          <span className="stat-label">To do</span>
        </div>
        <strong className="stat-value">{active}</strong>
        <span className="stat-caption">Waiting to be completed</span>
      </article>

      <article className="stat-card stat-card--mint">
        <div className="stat-topline">
          <span className="stat-icon" aria-hidden="true">✓</span>
          <span className="stat-label">Completed</span>
        </div>
        <strong className="stat-value">{completed}</strong>
        <div className="stat-progress" aria-label={`${completionRate}% completed`}>
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <span className="stat-caption">{completionRate}% of all tasks</span>
      </article>
    </section>
  );
});

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete, disabled }) {
  return (
    <article className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label className="checkbox-wrap">
        <input
          className="todo-checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, todo.completed)}
          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'to do' : 'completed'}`}
          disabled={disabled}
        />
        <span className="custom-checkbox" aria-hidden="true">✓</span>
      </label>

      <div className="todo-content">
        <p className="todo-title">{todo.text}</p>
        <div className="todo-meta">
          <span className={`todo-tag ${todo.completed ? 'todo-tag--done' : 'todo-tag--pending'}`}>
            <span className="tag-dot" />
            {todo.completed ? 'Completed' : 'To do'}
          </span>
          <span className="todo-date">{formatDate(todo.createdAt)}</span>
        </div>
      </div>

      <button
        className="delete-btn"
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        title="Delete task"
        disabled={disabled}
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </article>
  );
});

const TodoList = memo(function TodoList({ todos, onToggle, onDelete, disabled, loading }) {
  if (loading && todos.length === 0) {
    return <div className="empty-state"><p>Loading tasks...</p></div>;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-illustration" aria-hidden="true">✦</div>
        <h3>No tasks here yet</h3>
        <p>Add a task or change the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </div>
  );
});

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
          setError('Could not connect to JSON Server. Make sure the server is running on port 3001.');
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
      await requestTodos(`${API_URL}/todos/${id}`, { method: 'DELETE' });
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

      setNotice(`Imported ${externalTodos.length} sample tasks from JSONPlaceholder.`);
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
            <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
            <span className="brand-name">task<span>.</span></span>
          </div>
          <div className="header-note">
            <span className="header-note-dot" />
            Task manager
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>Your tasks,<br /><span>organized.</span></h1>
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
              <h2 id="tasks-heading">Task list <span>{stats.total}</span></h2>
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

          {error && <p className="app-message app-message--error" role="alert">{error}</p>}
          {notice && <p className="app-message app-message--success" role="status">{notice}</p>}

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
