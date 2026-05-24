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
    // /oauth/callback 페이지는 자체적으로 에러를 처리하므로 강제 리다이렉트 제외
    const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
    const isOAuthCallback = window.location.pathname === '/oauth/callback';
    if (error.response?.status === 401 && !isAuthEndpoint && !isOAuthCallback) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
