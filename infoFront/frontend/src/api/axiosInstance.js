import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // /api/auth/* 엔드포인트의 401은 인증 실패 응답이므로 자동 로그아웃 제외
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
