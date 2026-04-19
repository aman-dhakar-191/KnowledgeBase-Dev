import { Link } from 'react-router-dom';
import { FiClock, FiTag, FiGitBranch, FiTrash2, FiEdit } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

function toDate(ts) {
  if (!ts) return null;
  if (ts instanceof Date) return ts;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000);
  if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
  return null;
}

export default function NoteCard({ note, onDelete }) {
  const { isAdmin } = useAuth();
  const updatedAt = toDate(note.updatedAt);
  const validDate = updatedAt && !isNaN(updatedAt);

  const syncColor = note.syncStatus === 'SYNCED' ? '#4CAF50' : note.syncStatus === 'FAILED' ? '#f44336' : '#FF9800';

  return (
    <article className="note-card">
      <div className="note-card__header">
        <Link to={`/note/${note.id}`} className="note-card__title">
          {note.title}
        </Link>
        {isAdmin && (
          <div className="note-card__actions">
            <Link to={`/note/${note.id}`} className="note-card__action-btn" aria-label="Edit note" title="Edit">
              <FiEdit />
            </Link>
            {onDelete && (
              <button
                className="note-card__action-btn note-card__action-btn--danger"
                onClick={() => onDelete(note.id)}
                aria-label="Delete note"
                title="Delete"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        )}
      </div>

      {note.content && (
        <p className="note-card__preview">
          {note.content.replace(/[#*`[\]()>_~]/g, '').substring(0, 150)}
          {note.content.length > 150 ? '…' : ''}
        </p>
      )}

      <div className="note-card__meta">
        {validDate && (
          <span className="note-card__date">
            <FiClock /> {formatDistanceToNow(updatedAt, { addSuffix: true })}
          </span>
        )}
        <span className="note-card__sync" style={{ color: syncColor }} title={`Sync: ${note.syncStatus || 'PENDING'}`}>
          <FiGitBranch /> {note.syncStatus || 'PENDING'}
        </span>
        {note.version && <span className="note-card__version">v{note.version}</span>}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="note-card__tags">
          <FiTag />
          {note.tags.map((tag) => (
            <span key={tag} className="tag-chip tag-chip--sm">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
