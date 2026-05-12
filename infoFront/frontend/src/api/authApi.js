import axiosInstance from './axiosInstance';

export const checkUserId = (userId) =>
  axiosInstance.get('/api/auth/check-id', { params: { userId } });

export const signup = (data) => axiosInstance.post('/api/auth/signup', data);

export const login = (data) => axiosInstance.post('/api/auth/login', data);
