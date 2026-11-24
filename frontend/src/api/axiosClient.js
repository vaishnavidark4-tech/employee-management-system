import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
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

    return Promise.reject({ message, errors, status });
  }
);

export default axiosClient;
