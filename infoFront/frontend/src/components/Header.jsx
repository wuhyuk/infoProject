import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginRequiredModal from './LoginRequiredModal';
import './Header.css';

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => pathname === path ? 'active' : '';

  const requireAuth = (to) => {
    if (user) {
      navigate(to);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
      <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#1B4FD8"/>
            <rect x="7" y="6" width="15" height="19" rx="2.5" fill="white"/>
            <rect x="10" y="11" width="9" height="1.8" rx="0.9" fill="#C7D9FF"/>
            <rect x="10" y="14.5" width="9" height="1.8" rx="0.9" fill="#C7D9FF"/>
            <path d="M 10 20 L 13 23 L 20 16.5" stroke="#1B4FD8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          정보나라
        </Link>
        <nav className="header-nav">
          <Link to="/" className={isActive('/')}>홈</Link>
          <button className={`nav-text-btn ${isActive('/filter')}`} onClick={() => requireAuth('/filter')}>혜택 검색</button>
          <button className={`nav-text-btn ${isActive('/announcements')}`} onClick={() => requireAuth('/announcements')}>정책 소식</button>
          {user ? (
            <>
              <Link to="/mypage" className={isActive('/mypage')}>{user.name}님</Link>
              <button className="nav-logout" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>로그인</Link>
              <Link to="/signup" className="nav-signup">회원가입</Link>
            </>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}

export default Header;
