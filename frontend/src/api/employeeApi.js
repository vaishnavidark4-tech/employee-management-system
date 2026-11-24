import axiosClient from './axiosClient';

export const getEmployees = (params) => axiosClient.get('/employees', { params }).then((res) => res.data);

export const getEmployeeOptions = () => axiosClient.get('/employees/options').then((res) => res.data.data);

export const getEmployeeById = (id) => axiosClient.get(`/employees/${id}`).then((res) => res.data.data);

export const createEmployee = (data) => axiosClient.post('/employees', data).then((res) => res.data);

export const updateEmployee = (id, data) => axiosClient.put(`/employees/${id}`, data).then((res) => res.data);

export const deleteEmployee = (id) => axiosClient.delete(`/employees/${id}`).then((res) => res.data);
