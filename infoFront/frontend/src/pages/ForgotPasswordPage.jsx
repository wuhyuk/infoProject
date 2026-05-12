import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendVerificationCode, verifyCode, resetPassword } from '../api/authApi';
import './AuthPage.css';

// step: 'EMAIL' → 'CODE' → 'PASSWORD' → done
function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]           = useState('EMAIL');
  const [email, setEmail]         = useState('');
  const [code, setCode]           = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirm: '' });
  const [error, setError]         = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (step !== 'CODE') return;
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendVerificationCode(email, 'reset');
      setStep('CODE');
    } catch (err) {
      setError(err.response?.data?.message || '코드 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyCode(email, code);
      setStep('PASSWORD');
    } catch (err) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setFieldError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwords.newPassword.length < 8) {
      setFieldError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    setError('');
    setFieldError('');
    setLoading(true);
    try {
      await resetPassword(email, passwords.newPassword);
      navigate('/login', { state: { message: '비밀번호가 재설정됐습니다. 새 비밀번호로 로그인해주세요.' } });
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>비밀번호 찾기</h1>
        <p className="auth-desc">이메일 인증 후 새 비밀번호를 설정하세요.</p>

        <div className="step-indicator">
          <span className={step === 'EMAIL' ? 'step active' : 'step done'}>1 이메일 입력</span>
          <span className="step-divider">›</span>
          <span className={step === 'CODE' ? 'step active' : step === 'PASSWORD' ? 'step done' : 'step'}>2 코드 확인</span>
          <span className="step-divider">›</span>
          <span className={step === 'PASSWORD' ? 'step active' : 'step'}>3 새 비밀번호</span>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {step === 'EMAIL' && (
          <form onSubmit={handleSendCode} className="auth-form">
            <div className="form-row">
              <label>가입한 이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="example@email.com"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '발송 중...' : '인증 코드 발송'}
            </button>
          </form>
        )}

        {step === 'CODE' && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <div className="form-row">
              <label>이메일</label>
              <input type="email" value={email} disabled className="input-disabled" />
            </div>
            <div className="form-row">
              <label>인증 코드</label>
              <div className="code-input-wrap">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  placeholder="6자리 숫자"
                  maxLength={6}
                  required
                />
                {countdown > 0
                  ? <span className="code-timer">{formatTime(countdown)}</span>
                  : <span className="code-timer expired">만료됨</span>
                }
              </div>
              <span className="field-hint">이메일로 발송된 6자리 코드를 입력하세요.</span>
            </div>
            <button type="submit" className="submit-btn" disabled={loading || countdown === 0}>
              {loading ? '확인 중...' : '인증 확인'}
            </button>
            <button
              type="button"
              className="link-btn"
              onClick={() => { setStep('EMAIL'); setCode(''); setError(''); }}
            >
              이메일 변경 / 재발송
            </button>
          </form>
        )}

        {step === 'PASSWORD' && (
          <form onSubmit={handleReset} className="auth-form">
            <div className="verified-badge">✓ {email} 인증 완료</div>
            <div className="form-row">
              <label>새 비밀번호</label>
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => { setPasswords((p) => ({ ...p, newPassword: e.target.value })); setFieldError(''); }}
                placeholder="8자 이상"
                minLength={8}
                required
              />
            </div>
            <div className="form-row">
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => { setPasswords((p) => ({ ...p, confirm: e.target.value })); setFieldError(''); }}
                placeholder="비밀번호 재입력"
                className={fieldError ? 'input-error' : ''}
                required
              />
              {fieldError && <span className="field-error">{fieldError}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '재설정 중...' : '비밀번호 재설정'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">← 로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
