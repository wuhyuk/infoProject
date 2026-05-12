import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/adminApi';
import { useAdminAuth } from '../context/AdminContext';
import './AdminLoginPage.css';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await adminLogin(form);
      loginAdmin({ name: data.name, userId: data.userId }, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-icon">🔐</div>
        <h1>관리자 로그인</h1>
        <p className="admin-login-desc">관리자 계정으로 로그인하세요.</p>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-row">
            <label>아이디</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="관리자 아이디"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-form-row">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <button className="admin-back-link" onClick={() => navigate('/login')}>
          ← 일반 로그인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
