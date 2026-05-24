import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkUserId, signup } from '../api/authApi';
import './AuthPage.css';

const GOOGLE_SVG = (
  <svg className="social-icon" width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: '', name: '', password: '', passwordConfirm: '' });
  const [idStatus, setIdStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken'
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'userId') setIdStatus('idle');
  };

  const handleCheckId = async () => {
    const userId = form.userId.trim();
    if (!userId) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId)) {
      setFieldErrors((prev) => ({ ...prev, userId: '올바른 이메일 형식을 입력해주세요.' }));
      return;
    }
    setIdStatus('checking');
    try {
      const { data } = await checkUserId(userId);
      setIdStatus(data.available ? 'available' : 'taken');
    } catch {
      setIdStatus('idle');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (idStatus !== 'available') {
      errors.userId = '이메일 중복 확인을 완료해주세요.';
    }
    if (form.password !== form.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({ userId: form.userId.trim(), password: form.password, name: form.name });
      navigate('/login', { state: { message: '회원가입이 완료됐습니다. 로그인해주세요.' } });
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const idStatusMsg = {
    available: { text: '사용 가능한 이메일입니다.', cls: 'field-ok' },
    taken:     { text: '이미 가입된 이메일입니다.', cls: 'field-error' },
    checking:  { text: '확인 중...', cls: 'field-hint' },
  }[idStatus];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>회원가입</h1>
        <p className="auth-desc">가입 후 마이페이지에서 내 정보를 저장하세요.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* 이메일 */}
          <div className="form-row">
            <label>이메일 <span className="required">*</span></label>
            <div className="input-with-btn">
              <input
                type="email"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="example@email.com"
                className={fieldErrors.userId || idStatus === 'taken' ? 'input-error' : idStatus === 'available' ? 'input-ok' : ''}
                maxLength={50}
                required
              />
              <button
                type="button"
                className="check-btn"
                onClick={handleCheckId}
                disabled={idStatus === 'checking' || !form.userId}
              >
                중복 확인
              </button>
            </div>
            {fieldErrors.userId && <span className="field-error">{fieldErrors.userId}</span>}
            {!fieldErrors.userId && idStatusMsg && (
              <span className={idStatusMsg.cls}>{idStatusMsg.text}</span>
            )}
          </div>

          {/* 이름 */}
          <div className="form-row">
            <label>이름 <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />
          </div>

          {/* 비밀번호 */}
          <div className="form-row">
            <label>비밀번호 <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8자 이상"
              minLength={8}
              required
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-row">
            <label>비밀번호 확인 <span className="required">*</span></label>
            <input
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호 재입력"
              className={fieldErrors.passwordConfirm ? 'input-error' : ''}
              required
            />
            {fieldErrors.passwordConfirm && (
              <span className="field-error">{fieldErrors.passwordConfirm}</span>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="social-divider"><span>또는 소셜 계정으로 가입</span></div>
        <div className="social-buttons">
          <a href={`${process.env.REACT_APP_BACKEND_URL}/oauth2/authorization/google`} className="social-btn social-google">
            {GOOGLE_SVG}
            Google로 계속하기
          </a>
          <a href={`${process.env.REACT_APP_BACKEND_URL}/oauth2/authorization/naver`} className="social-btn social-naver">
            <span className="social-icon" style={{ fontWeight: 900, fontSize: '16px' }}>N</span>
            네이버로 계속하기
          </a>
        </div>

        <p className="auth-switch" style={{ marginTop: '16px' }}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
