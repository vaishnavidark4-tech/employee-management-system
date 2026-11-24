// Saves the login token + user in localStorage, so the user stays logged in after a refresh.
// Wrapped in try/catch because localStorage can be blocked (e.g. some private browsing modes).

const TOKEN_KEY = 'etm_token';
const USER_KEY = 'etm_user';

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const saveAuth = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore, the user will just need to log in again after refresh
  }
};

export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
};

// Fired by the axios client when the server says the token is invalid / expired
export const AUTH_EXPIRED_EVENT = 'auth:expired';
