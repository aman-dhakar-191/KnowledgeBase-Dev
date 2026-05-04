import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  return (
    <div className="notif-bell" ref={ref}>
      <button
        className="notif-bell__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel__header">
            <span className="notif-panel__title">
              Notifications
              {unreadCount > 0 && <span className="notif-panel__count">{unreadCount}</span>}
            </span>
            {unreadCount > 0 && (
              <button className="notif-panel__mark-all" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-panel__list">
            {notifications.length === 0 ? (
              <div className="notif-panel__empty">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={n}
                  onRead={markRead}
                  onRemove={remove}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifItem({ notif, onRead, onRemove, onClose }) {
  const ts = notif.createdAt;
  const date = ts
    ? ts.toDate?.() || (ts.seconds ? new Date(ts.seconds * 1000) : null)
    : null;

  const handleClick = () => {
    if (!notif.isRead) onRead(notif.id);
    onClose();
  };

  return (
    <div className={`notif-item ${notif.isRead ? '' : 'notif-item--unread'}`}>
      <Link to={`/note/${notif.noteId}`} className="notif-item__body" onClick={handleClick}>
        <span className="notif-item__title">{notif.noteTitle}</span>
        <span className="notif-item__sub">by {notif.authorEmail}</span>
        {date && (
          <span className="notif-item__time">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        )}
      </Link>
      <button
        className="notif-item__delete"
        onClick={() => onRemove(notif.id)}
        aria-label="Dismiss notification"
      >
        <FiTrash2 />
      </button>
    </div>
  );
}
