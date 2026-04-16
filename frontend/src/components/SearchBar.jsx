import { FiSearch, FiX } from 'react-icons/fi';
import { useApp } from '../contexts/AppContext';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useApp();

  return (
    <div className="search-bar">
      <FiSearch className="search-bar__icon" />
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search notes"
      />
      {searchQuery && (
        <button
          className="search-bar__clear"
          onClick={() => setSearchQuery('')}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}
