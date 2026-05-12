import axiosInstance from './axiosInstance';

export const getAllBenefits = () => axiosInstance.get('/api/benefits');

export const getFilteredBenefits = (profile) =>
  axiosInstance.post('/api/benefits/filter', profile);

export const getAnnouncements = (days = 14) =>
  axiosInstance.get(`/api/announcements?days=${days}`);
