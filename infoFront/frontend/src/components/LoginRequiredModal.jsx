import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRequiredModal.css';

function LoginRequiredModal({ onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>

        <div className="modal-icon">🔒</div>
        <h2 className="modal-title">로그인이 필요한 서비스입니다</h2>
        <p className="modal-desc">
          혜택 검색과 정책 소식은 로그인 후 이용할 수 있습니다.<br />
          로그인하고 나에게 맞는 혜택을 찾아보세요.
        </p>

        <div className="modal-actions">
          <button
            className="modal-btn-primary"
            onClick={() => navigate('/login')}
          >
            로그인
          </button>
          <button
            className="modal-btn-secondary"
            onClick={() => navigate('/signup')}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginRequiredModal;
