import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import FilterPage from './pages/FilterPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AnnouncementPage from './pages/AnnouncementPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
          <Routes>
            {/* 관리자 라우트 (일반 헤더 없음) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* 일반 라우트 */}
            <Route path="/*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/filter" element={<FilterPage />} />
                    <Route path="/results" element={<ResultPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/profile-setup" element={<ProfileSetupPage />} />
                    <Route path="/announcements" element={<AnnouncementPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
