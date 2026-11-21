import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

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

function formatDate(timestamp) {
  if (!timestamp) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function TodoForm({ onAdd }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('pending');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Please enter a task');
      return;
    }

    if (trimmedText.length > 140) {
      setError('Task title must be 140 characters or fewer');
      return;
    }

    onAdd(trimmedText, type);
    setText('');
    setType('pending');
    setError('');
  };

  return (
    <section className="composer-card" aria-labelledby="composer-title">
      <div className="section-kicker">ADD A TASK</div>
      <h2 className="composer-title" id="composer-title">
        Create a task
      </h2>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        <label className="sr-only" htmlFor="todo-text">
          Task title
        </label>
        <input
          id="todo-text"
          className="todo-input"
          type="text"
          placeholder="e.g. Prepare the presentation..."
          value={text}
          maxLength={140}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError('');
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'todo-error' : undefined}
        />

        <label className="sr-only" htmlFor="todo-initial-status">
          Initial task status
        </label>
        <select
          id="todo-initial-status"
          className="status-select"
          value={type}
          onChange={(event) => setType(event.target.value)}
        >
          <option value="pending">To do</option>
          <option value="done">Completed</option>
        </select>

        <button className="add-button" type="submit">
          <span aria-hidden="true">＋</span>
          Add task
        </button>
      </form>

      <div className="composer-footer">
        {error ? (
          <p className="form-error" id="todo-error" role="alert">
            {error}
          </p>
        ) : (
          <p className="form-hint">Press Enter to add your task</p>
        )}
        <span className="character-count">{text.length}/140</span>
      </div>
    </section>
  );
}

const Filters = memo(function Filters({
  currentFilter,
  onFilterChange,
  counts,
}) {
  return (
    <div className="filters" role="group" aria-label="Task filters">
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
        <span className="stat-caption">Tasks in your list</span>
      </article>

      <article className="stat-card stat-card--peach">
        <div className="stat-topline">
          <span className="stat-icon" aria-hidden="true">◷</span>
          <span className="stat-label">To do</span>
        </div>
        <strong className="stat-value">{active}</strong>
        <span className="stat-caption">Remaining tasks</span>
      </article>

      <article className="stat-card stat-card--mint">
        <div className="stat-topline">
          <span className="stat-icon" aria-hidden="true">✓</span>
          <span className="stat-label">Completed</span>
        </div>
        <strong className="stat-value">{completed}</strong>
        <div className="stat-progress" aria-label={`Completed ${completionRate}%`}>
          <span style={{ width: `${completionRate}%` }} />
        </div>
        <span className="stat-caption">{completionRate}% of all tasks</span>
      </article>
    </section>
  );
});

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <article className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <label className="checkbox-wrap">
        <input
          className="todo-checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark “${todo.text}” as ${todo.completed ? 'incomplete' : 'complete'}`}
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
        aria-label={`Delete task “${todo.text}”`}
        title="Delete task"
      >
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
          <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </article>
  );
});

const TodoList = memo(function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-illustration" aria-hidden="true">✦</div>
        <h3>No tasks here yet</h3>
        <p>Add a task to get started.</p>
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
        />
      ))}
    </div>
  );
});

export default function App() {
  const [todos, setTodos] = useState(readTodosFromStorage);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Could not save tasks:', error);
    }
  }, [todos]);

  const addTodo = useCallback((text, type) => {
    const newTodo = {
      id: Date.now() + Math.random(),
      text,
      completed: type === 'done',
      createdAt: Date.now(),
    };

    setTodos((previousTodos) => [newTodo, ...previousTodos]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((previousTodos) =>
      previousTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((previousTodos) =>
      previousTodos.filter((todo) => todo.id !== id)
    );
  }, []);

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const active = todos.length - completed;

    return {
      total: todos.length,
      active,
      completed,
      counts: {
        all: todos.length,
        active,
        completed,
      },
    };
  }, [todos]);

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    if (filter === 'active') {
      result = result.filter((todo) => !todo.completed);
    } else if (filter === 'completed') {
      result = result.filter((todo) => todo.completed);
    }
    return [...result].sort((first, second) => {
      if (sort === 'alphabet') {
        return first.text.localeCompare(second.text, 'en');
      }

      if (sort === 'oldest') {
        return (first.createdAt || 0) - (second.createdAt || 0);
      }

      return (second.createdAt || 0) - (first.createdAt || 0);
    });
  }, [todos, filter, sort]);

  return (
    <main className="app-shell">
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />

      <div className="app">
        <section className="welcome">
          <div>
            <p className="eyebrow">TASK OVERVIEW</p>
            <h1>Your tasks,<br /><span>organized.</span></h1>
            <p className="welcome-description">
              Plan, track, and complete your tasks.
            </p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <span className="art-sun">✳</span>
            <span className="art-sparkle">✦</span>
            <span className="art-circle" />
          </div>
        </section>

        <TodoForm onAdd={addTodo} />

        <Stats
          total={stats.total}
          active={stats.active}
          completed={stats.completed}
        />

        <section className="tasks-section" aria-labelledby="tasks-heading">
          <div className="tasks-heading-row">
            <div>
              <p className="section-kicker">YOUR TASKS</p>
              <h2 id="tasks-heading">Tasks <span>{stats.total}</span></h2>
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
          </div>

          <TodoList
            todos={filteredAndSortedTodos}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        </section>

      </div>
    </main>
  );
}
