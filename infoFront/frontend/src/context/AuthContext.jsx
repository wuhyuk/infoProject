import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile } from '../api/userApi';

const AuthContext = createContext(null);

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token  = sessionStorage.getItem('token');
    const stored = sessionStorage.getItem('user');
    if (!isTokenValid(token)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return null;
    }
    return stored ? JSON.parse(stored) : null;
  });

  // 앱 초기 로드 시 토큰을 서버에서 검증 — 서버 재시작 등으로 세션이 무효화된 경우를 감지
  // 실패 시 axiosInstance의 401 인터셉터가 세션 정리 + /login 리다이렉트를 처리
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!isTokenValid(token)) return;
    getMyProfile().catch(() => {});
  }, []);

  const loginUser = (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
