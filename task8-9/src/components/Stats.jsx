import { memo } from 'react';

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

export default Stats;
