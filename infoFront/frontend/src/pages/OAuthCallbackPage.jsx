import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMyProfile } from '../api/userApi';
import { useAuth } from '../context/AuthContext';

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // 토큰을 먼저 저장해야 axiosInstance가 인증 헤더를 붙일 수 있음
    sessionStorage.setItem('token', token);

    getMyProfile()
      .then(({ data }) => {
        loginUser({ name: data.name, userId: data.userId }, token);
        const isNewProfile = !data.birthYear && !data.region && !data.employmentStatus;
        navigate(isNewProfile ? '/profile-setup' : '/filter', { replace: true });
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        navigate('/login?error=oauth_failed', { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 60px)',
      color: '#475569',
      fontSize: '0.97rem',
    }}>
      로그인 처리 중...
    </div>
  );
}

export default OAuthCallbackPage;
