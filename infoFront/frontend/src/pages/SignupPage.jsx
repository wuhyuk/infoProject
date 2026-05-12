import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkUserId, signup } from '../api/authApi';
import './AuthPage.css';

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
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(userId)) {
      setFieldErrors((prev) => ({ ...prev, userId: '영문·숫자·밑줄 4~20자로 입력해주세요.' }));
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
      errors.userId = '아이디 중복 확인을 완료해주세요.';
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
      await signup({ userId: form.userId, password: form.password, name: form.name });
      navigate('/login', { state: { message: '회원가입이 완료됐습니다. 로그인해주세요.' } });
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const idStatusMsg = {
    available: { text: '사용 가능한 아이디입니다.', cls: 'field-ok' },
    taken:     { text: '이미 사용 중인 아이디입니다.', cls: 'field-error' },
    checking:  { text: '확인 중...', cls: 'field-hint' },
  }[idStatus];

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>회원가입</h1>
        <p className="auth-desc">가입 후 마이페이지에서 내 정보를 저장하세요.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* 아이디 */}
          <div className="form-row">
            <label>아이디 <span className="required">*</span></label>
            <div className="input-with-btn">
              <input
                type="text"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                placeholder="영문·숫자·밑줄 4~20자"
                className={fieldErrors.userId || idStatus === 'taken' ? 'input-error' : idStatus === 'available' ? 'input-ok' : ''}
                maxLength={20}
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

        <p className="auth-switch">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
