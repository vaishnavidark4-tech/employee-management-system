import axios from 'axios';
import { AUTH_EXPIRED_EVENT, clearAuth, getToken } from '../utils/authStorage';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // 60s because the free Render backend can take ~30-50s to wake up after sleeping
  timeout: 60000,
});

// Send the login token with every request
axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Convert every failed response into a simple error object:
// { message: 'Readable message', errors: { field: 'message' }, status: 400 }
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    let message = 'Something went wrong. Please try again.';
    let errors = null;
    const status = error.response?.status;

    if (error.response) {
      let data = error.response.data;
      // CSV export uses responseType "blob", so the error JSON comes as a Blob
      if (data instanceof Blob) {
        try {
          data = JSON.parse(await data.text());
        } catch {
          data = null;
        }
      }
      message = data?.message || message;
      errors = data?.errors || null;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Server is taking too long to respond. Please try again.';
    } else {
      message = 'Unable to connect to the server. Please check your internet or try again later.';
    }

    // Token missing / expired -> log the user out (but not for a wrong password on the login form)
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (status === 401 && !isLoginRequest) {
      clearAuth();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject({ message, errors, status });
  }
);

export default axiosClient;
