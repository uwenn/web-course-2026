import { memo } from 'react';
import TodoItem from './TodoItem.jsx';

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

export default TodoList;
