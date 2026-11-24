import axiosClient from './axiosClient';

export const getDashboard = () => axiosClient.get('/dashboard').then((res) => res.data.data);
