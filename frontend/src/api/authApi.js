import axiosClient from './axiosClient';

export const loginUser = (credentials) => axiosClient.post('/auth/login', credentials).then((res) => res.data);

export const getCurrentUser = () => axiosClient.get('/auth/me').then((res) => res.data.data);
