import { useState } from 'react';

export default function TodoForm({ onAdd, disabled }) {
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

        <button
          className="add-button"
          type="submit"
          disabled={disabled || !text.trim()}
        >
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
