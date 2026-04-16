import { FiMenu, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

export default function Header({ onMenuClick }) {
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <FiMenu />
        </button>
        <Link to="/" className="header__brand">
          📚 KnowledgeBase
        </Link>
      </div>
      <div className="header__center">
        <SearchBar />
      </div>
      <div className="header__right">
        <Link to="/new" className="btn btn--primary btn--sm">
          <FiPlus /> New Note
        </Link>
      </div>
    </header>
  );
}
