import { memo } from 'react';

const FILTERS = [
  { id: 'all', label: 'All tasks' },
  { id: 'active', label: 'To do' },
  { id: 'completed', label: 'Completed' },
];

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

export default Filters;
