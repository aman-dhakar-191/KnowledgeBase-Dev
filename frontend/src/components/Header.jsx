import { FiMenu, FiPlus, FiLogIn, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  online:   { label: 'Connected', className: 'connection-status--online' },
  offline:  { label: 'Offline',   className: 'connection-status--offline' },
  checking: { label: 'Connecting', className: 'connection-status--checking' },
};

export default function Header({ onMenuClick }) {
  const { apiStatus } = useApp();
  const { user, isAdmin, signIn, signOut } = useAuth();
  const { label, className } = STATUS_CONFIG[apiStatus] ?? STATUS_CONFIG.checking;

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <FiMenu />
        </button>
        <Link to="/" className="header__brand">
          📚 KnowledgeBase
        </Link>
        <span className={`connection-status ${className}`}>
          <span className="connection-status__dot" />
          <span className="connection-status__label">{label}</span>
        </span>
      </div>
      <div className="header__center">
        <SearchBar />
      </div>
      <div className="header__right">
        {isAdmin && (
          <Link to="/new" className="btn btn--primary btn--sm">
            <FiPlus /> New Note
          </Link>
        )}
        {user ? (
          <div className="header__user">
            {user.photoURL && (
              <img
                className="header__avatar"
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
              />
            )}
            <button className="btn btn--ghost btn--sm" onClick={signOut} title="Sign out">
              <FiLogOut />
            </button>
          </div>
        ) : (
          <button className="btn btn--outline btn--sm" onClick={signIn}>
            <FiLogIn /> Sign in
          </button>
        )}
      </div>
    </header>
  );
}
