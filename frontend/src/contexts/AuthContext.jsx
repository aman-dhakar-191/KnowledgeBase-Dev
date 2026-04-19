import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Pick up the result when returning from a redirect sign-in on mobile
    getRedirectResult(auth).catch(() => {});
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const isAdmin = Boolean(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);
  const signIn = () =>
    isMobile ? signInWithRedirect(auth, googleProvider) : signInWithPopup(auth, googleProvider);
  const signOut = () => fbSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, authLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
