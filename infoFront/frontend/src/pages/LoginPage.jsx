import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { login } from '../api/authApi';
import { getMyProfile } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import SocialLoginButtons from '../components/SocialLoginButtons';
import './AuthPage.css';

const OAUTH_ERROR_MESSAGES = {
  email_exists:         '이미 이메일/비밀번호로 가입된 계정입니다. 일반 로그인을 이용해주세요.',
  email_social_conflict:'이미 다른 소셜 계정으로 가입된 이메일입니다. 기존 소셜 로그인을 이용해주세요.',
  missing_email:        '소셜 계정에 이메일 정보가 없습니다. 이메일 제공에 동의 후 다시 시도해주세요.',
  oauth_failed:         '소셜 로그인에 실패했습니다. 다시 시도해주세요.',
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginUser } = useAuth();
  const [form, setForm]             = useState({ userId: '', password: '' });
  const [error, setError]           = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const successMsg  = location.state?.message;
  const oauthError  = searchParams.get('error');
  const oauthErrMsg = OAUTH_ERROR_MESSAGES[oauthError];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser({ name: data.name, userId: data.userId }, data.token);
      try {
        const { data: profile } = await getMyProfile();
        const isNewProfile = !profile.birthYear && !profile.region && !profile.employmentStatus;
        navigate(isNewProfile ? '/profile-setup' : '/filter');
      } catch {
        navigate('/filter');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setFieldError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(err.response?.data?.message || '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      <div className="auth-container">
        <h1>로그인</h1>
        <p className="auth-desc">내 정보에 맞는 혜택을 찾아보세요.</p>

        {successMsg  && <div className="success-banner">{successMsg}</div>}
        {oauthErrMsg && <div className="oauth-error">{oauthErrMsg}</div>}
        {error       && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <label>아이디</label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              placeholder="아이디 입력"
              required
            />
          </div>
          <div className="form-row">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              className={fieldError ? 'input-error' : ''}
              required
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="social-divider"><span>또는 소셜 계정으로 로그인</span></div>
        <SocialLoginButtons />

        <div className="auth-links">
          <p className="auth-switch">
            계정이 없으신가요? <Link to="/signup">회원가입</Link>
          </p>
          <p className="auth-switch">
            <button className="forgot-btn" onClick={() => setShowForgot(true)}>
              비밀번호를 잊으셨나요?
            </button>
          </p>
        </div>
        <p className="auth-switch" style={{ marginTop: '32px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
          <Link to="/admin/login" style={{ fontSize: '0.75rem', color: '#bbb' }}>관리자</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
