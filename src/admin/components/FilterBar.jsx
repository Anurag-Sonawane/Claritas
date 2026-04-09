import { Search, X } from 'lucide-react';
import './FilterBar.css';

export default function FilterBar({ 
  searchValue, 
  onSearchChange, 
  searchPlaceholder = 'Search...', 
  filters = [], 
  activeFilters = {}, 
  onFilterChange, 
  onClearFilters 
}) {
  const hasActiveFilters = Object.values(activeFilters).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <Search size={16} className="filter-search-icon" />
        <input
          type="text"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>

      {filters.map(filter => (
        <div key={filter.key} className="filter-dropdown">
          <select
            value={activeFilters[filter.key] || ''}
            onChange={e => onFilterChange(filter.key, e.target.value)}
          >
            <option value="">{filter.label}</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}

      {hasActiveFilters && (
        <div className="filter-chips">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find(f => f.key === key);
            const option = filter?.options.find(o => o.value === value);
            return (
              <span key={key} className="filter-chip">
                {filter?.label}: {option?.label || value}
                <button className="filter-chip-clear" onClick={() => onFilterChange(key, '')}>
                  <X size={12} />
                </button>
              </span>
            );
          })}
          <button className="filter-clear-all" onClick={onClearFilters}>Clear all</button>
        </div>
      )}
    </div>
  );
}
