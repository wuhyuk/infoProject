import axios from 'axios';

const adminAxios = axios.create();

adminAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const adminLogin = (data) => adminAxios.post('/api/admin/auth/login', data);

export const getAdminBenefits = () => adminAxios.get('/api/admin/benefits');
export const createBenefit = (data) => adminAxios.post('/api/admin/benefits', data);
export const updateBenefit = (id, data) => adminAxios.put(`/api/admin/benefits/${id}`, data);
export const deleteBenefit = (id) => adminAxios.delete(`/api/admin/benefits/${id}`);
export const syncBenefits = () => adminAxios.post('/api/admin/benefits/sync');

export const getAdminUsers = () => adminAxios.get('/api/admin/users');
export const deleteUser = (id) => adminAxios.delete(`/api/admin/users/${id}`);

export const getAdminStats = () => adminAxios.get('/api/admin/stats');
