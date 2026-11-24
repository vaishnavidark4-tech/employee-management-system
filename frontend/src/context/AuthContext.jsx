import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser } from '../api/authApi';
import { AUTH_EXPIRED_EVENT, clearAuth, getStoredUser, getToken, saveAuth } from '../utils/authStorage';

const AuthContext = createContext(null);

/**
 * Keeps the logged-in user for the whole app.
 * On page load, a saved token is checked with GET /api/auth/me before showing protected pages.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  // "checking" while we confirm the saved token with the server
  const [checking, setChecking] = useState(() => !!getToken());

  useEffect(() => {
    if (!getToken()) return;
    getCurrentUser()
      .then((freshUser) => setUser(freshUser))
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  // The axios client fires this event when any request returns 401
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    saveAuth(res.data.token, res.data.user);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
