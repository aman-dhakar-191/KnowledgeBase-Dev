import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Real-time listener using Firestore onSnapshot.
    // Firestore rules allow authenticated users to read their own notification docs.
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(
      q,
      (snapshot) => setRawNotifications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Notification listener error:', err.message)
    );
  }, [user]);

  // When user is null (logged out) expose an empty array without calling setState
  // synchronously inside the effect, which triggers react-hooks/set-state-in-effect.
  const notifications = user ? rawNotifications : [];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = useCallback((id) => markNotificationRead(id).catch(console.error), []);

  const markAllRead = useCallback(() => markAllNotificationsRead().catch(console.error), []);

  const remove = useCallback((id) => deleteNotification(id).catch(console.error), []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
