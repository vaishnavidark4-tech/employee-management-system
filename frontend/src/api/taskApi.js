import axiosClient from './axiosClient';

export const getTasks = (params) => axiosClient.get('/tasks', { params }).then((res) => res.data);

export const getTaskById = (id) => axiosClient.get(`/tasks/${id}`).then((res) => res.data.data);

export const createTask = (data) => axiosClient.post('/tasks', data).then((res) => res.data);

export const updateTask = (id, data) => axiosClient.put(`/tasks/${id}`, data).then((res) => res.data);

// Status has its own API, the normal update API never changes status
export const updateTaskStatus = (id, status) =>
  axiosClient.put(`/tasks/${id}/status`, { status }).then((res) => res.data);

export const deleteTask = (id) => axiosClient.delete(`/tasks/${id}`).then((res) => res.data);

// Returns the CSV file as a Blob + file name sent by the server
export const exportTasksCsv = async (params) => {
  const res = await axiosClient.get('/tasks/export/csv', { params, responseType: 'blob' });
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  return { blob: res.data, fileName: match ? match[1] : 'tasks.csv' };
};
