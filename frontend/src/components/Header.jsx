import { FiMenu, FiPlus, FiLogIn, FiLogOut, FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close card when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [profileOpen]);

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
        {user && (
          <Link to="/new" className="btn btn--primary btn--sm">
            <FiPlus /> New Note
          </Link>
        )}
        {user ? (
          <div className="header__user" ref={profileRef}>
            <button
              className="header__avatar-btn"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile"
            >
              {user.photoURL ? (
                <img
                  className="header__avatar"
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="header__avatar header__avatar--fallback">
                  {(user.displayName || user.email || '?')[0].toUpperCase()}
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="profile-card">
                <div className="profile-card__top">
                  {user.photoURL ? (
                    <img
                      className="profile-card__avatar"
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="profile-card__avatar profile-card__avatar--fallback">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="profile-card__info">
                    <span className="profile-card__name">{user.displayName || 'User'}</span>
                    <span className="profile-card__email">{user.email}</span>
                    {isAdmin && (
                      <span className="profile-card__badge">
                        <FiShield /> Admin
                      </span>
                    )}
                  </div>
                </div>
                <div className="profile-card__divider" />
                <button
                  className="profile-card__signout"
                  onClick={() => { signOut(); setProfileOpen(false); }}
                >
                  <FiLogOut /> Sign out
                </button>
              </div>
            )}
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
