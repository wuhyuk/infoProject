import { createContext, useContext, useState, useEffect } from 'react';
import { getMyProfile } from '../api/userApi';
import { isTokenValid } from '../utils/jwtUtils';

const AuthContext = createContext(null);

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
  // /oauth/callback 페이지는 자체적으로 토큰을 처리하므로 중복 호출 방지
  // 실패 시 axiosInstance의 401 인터셉터가 세션 정리 + /login 리다이렉트를 처리
  useEffect(() => {
    if (window.location.pathname === '/oauth/callback') return;
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

  const updateUserName = (newName) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, name: newName };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
