import axiosInstance from './axiosInstance';

export const getMyProfile = () => axiosInstance.get('/api/users/me');

export const updateProfile = (data) => axiosInstance.put('/api/users/me/profile', data);
