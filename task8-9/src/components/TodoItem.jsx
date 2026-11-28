import { memo } from 'react';

function formatDate(timestamp) {
  if (!timestamp) return 'Date unavailable';

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

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

export default TodoItem;
