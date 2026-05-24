import { useEffect, useState } from 'react';
import { resetPassword } from '../api/authApi';
import './ForgotPasswordModal.css';

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ userId: '', name: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.userId.trim() || !form.name.trim()) {
      setError('아이디와 이름을 모두 입력해주세요.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (!form.newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ userId: form.userId.trim(), name: form.name.trim(), newPassword: form.newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-card" onClick={(e) => e.stopPropagation()}>
        <button className="fp-close" onClick={onClose} aria-label="닫기">✕</button>

        {done ? (
          <div className="fp-done">
            <div className="fp-done-icon">✓</div>
            <h2>비밀번호가 변경됐습니다</h2>
            <p>새 비밀번호로 로그인해주세요.</p>
            <button className="fp-btn-primary" onClick={onClose}>로그인하러 가기</button>
          </div>
        ) : (
          <>
            <div className="fp-step-bar">
              <span className={`fp-step-dot${step === 1 ? ' active' : ' done'}`} />
              <span className="fp-step-line" />
              <span className={`fp-step-dot${step === 2 ? ' active' : ''}`} />
            </div>

            <h2 className="fp-title">
              {step === 1 ? '계정 확인' : '새 비밀번호 설정'}
            </h2>
            <p className="fp-desc">
              {step === 1
                ? '가입 시 사용한 아이디(이메일)와 이름을 입력하세요.'
                : '새로 사용할 비밀번호를 입력하세요.'}
            </p>

            {error && <div className="fp-error">{error}</div>}

            {step === 1 ? (
              <form onSubmit={handleStep1} className="fp-form">
                <div className="fp-row">
                  <label>아이디 (이메일)</label>
                  <input
                    type="text"
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    placeholder="가입한 이메일 입력"
                    autoFocus
                  />
                </div>
                <div className="fp-row">
                  <label>이름</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="가입 시 등록한 이름"
                  />
                </div>
                <button type="submit" className="fp-btn-primary">다음</button>
              </form>
            ) : (
              <form onSubmit={handleStep2} className="fp-form">
                <div className="fp-row">
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="새 비밀번호 (6자 이상)"
                    autoFocus
                  />
                </div>
                <div className="fp-row">
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="새 비밀번호 다시 입력"
                    className={
                      form.confirmPassword && form.newPassword !== form.confirmPassword
                        ? 'input-mismatch'
                        : ''
                    }
                  />
                  {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                    <span className="fp-mismatch">비밀번호가 일치하지 않습니다.</span>
                  )}
                </div>
                <div className="fp-step2-actions">
                  <button
                    type="button"
                    className="fp-btn-back"
                    onClick={() => { setStep(1); setError(''); }}
                  >
                    이전
                  </button>
                  <button type="submit" className="fp-btn-primary" disabled={loading}>
                    {loading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
