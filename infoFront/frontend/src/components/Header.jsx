import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          나에게 맞는 혜택 찾기
        </Link>
        <nav className="header-nav">
          <Link to="/" className={isActive('/')}>홈</Link>
          <Link to="/filter" className={isActive('/filter')}>혜택 검색</Link>
          <Link to="/announcements" className={isActive('/announcements')}>정책 소식</Link>
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
  );
}

export default Header;
