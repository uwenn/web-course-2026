import { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';

const TodoForm = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState('pending');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, type);
    setText('');
  };

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Что нужно сделать?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="pending">В планах</option>
        <option value="done">Выполнено</option>
      </select>
      <button type="submit">Добавить</button>
    </form>
  );
};

const Filters = ({ currentFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'active', label: 'Активные' },
    { id: 'completed', label: 'Выполненные' }
  ];

  return (
    <div className="filters">
      {filters.map(f => (
        <button
          key={f.id}
          className={`filter-btn ${currentFilter === f.id ? 'active' : ''}`}
          onClick={() => onFilterChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
};

const Stats = ({ total, active, completed }) => (
  <div className="stats">
    <div className="stat-card">
      <span className="stat-label">Всего</span>
      <span className="stat-value">{total}</span>
    </div>
    <div className="stat-card">
      <span className="stat-label">В планах</span>
      <span className="stat-value">{active}</span>
    </div>
    <div className="stat-card">
      <span className="stat-label">Готово</span>
      <span className="stat-value">{completed}</span>
    </div>
  </div>
);

const TodoItem = ({ todo, onToggle, onDelete }) => (
  <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
    <input
      type="checkbox"
      className="todo-checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
    />
    <div className="todo-content">
      <div className="todo-title">{todo.text}</div>
      <span className="todo-tag">
        {todo.completed ? 'Готово' : 'В планах'}
      </span>
    </div>
    <button className="delete-btn" onClick={() => onDelete(todo.id)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg>
    </button>
  </div>
);

export default function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = useCallback((text, type) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: type === 'done',
      createdAt: Date.now()
    };
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []);

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos;

    if (filter === 'active') result = result.filter(t => !t.completed);
    if (filter === 'completed') result = result.filter(t => t.completed);

    result = [...result].sort((a, b) => {
      if (sort === 'alphabet') return a.text.localeCompare(b.text);
      if (sort === 'oldest') return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });

    return result;
  }, [todos, filter, sort]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }), [todos]);

  return (
    <div className="app">
      <header className="header">
        <h1>Задачи <span>/ Менеджер</span></h1>
      </header>

      <TodoForm onAdd={addTodo} />
      <Stats {...stats} />

      <div className="toolbar">
        <Filters currentFilter={filter} onFilterChange={setFilter} />
        <div className="sort-wrapper">
          <span>Сортировка:</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="alphabet">По алфавиту (А-Я)</option>
          </select>
        </div>
      </div>

      <div className="todo-list">
        {filteredAndSortedTodos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', background: '#18181b', borderRadius: '12px', border: '1px dashed #3f3f46' }}>
            Нет задач для отображения
          </div>
        ) : (
          filteredAndSortedTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>
    </div>
  );
}