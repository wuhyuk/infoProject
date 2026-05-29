import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateProfile, updateAccount } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import './MyPage.css';

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 10 - i);
const DISABILITY_GRADES = ['경증', '중증'];

function MyPage() {
  const { logoutUser, updateUserName } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  // 계정 정보 수정 상태
  const [accountForm, setAccountForm] = useState({ name: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState('');
  const [accountError, setAccountError] = useState('');

  const [form, setForm] = useState({
    birthYear: '',
    gender: '',
    region: '',
    incomeLevel: '',
    employmentStatus: '',
    hasDisability: false,
    disabilityGrade: '',
    familyType: '',
    isForeignWorker: false,
    isNorthKoreanDefector: false,
    maritalStatus: '',
    numberOfChildren: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMyProfile()
      .then(({ data }) => {
        setProfile(data);
        setAccountForm((prev) => ({ ...prev, name: data.name || '' }));
        setForm({
          birthYear: data.birthYear || '',
          gender: data.gender || '',
          region: data.region || '',
          incomeLevel: data.incomeLevel || '',
          employmentStatus: data.employmentStatus || '',
          hasDisability: data.hasDisability || false,
          disabilityGrade: data.disabilityGrade || '',
          familyType: data.familyType || '',
          isForeignWorker: data.isForeignWorker || false,
          isNorthKoreanDefector: data.isNorthKoreanDefector || false,
          maritalStatus: data.maritalStatus || '',
          numberOfChildren: data.numberOfChildren ?? '',
        });
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'hasDisability' && !checked) updated.disabilityGrade = '';
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);
    try {
      const payload = {
        birthYear: form.birthYear ? Number(form.birthYear) : null,
        gender: form.gender || null,
        region: form.region || null,
        incomeLevel: form.incomeLevel ? Number(form.incomeLevel) : null,
        employmentStatus: form.employmentStatus || null,
        hasDisability: form.hasDisability,
        disabilityGrade: form.hasDisability && form.disabilityGrade ? form.disabilityGrade : null,
        familyType: form.familyType || null,
        isForeignWorker: form.isForeignWorker,
        isNorthKoreanDefector: form.isNorthKoreanDefector,
        maritalStatus: form.maritalStatus || null,
        numberOfChildren: form.numberOfChildren !== '' ? Number(form.numberOfChildren) : null,
      };
      const { data } = await updateProfile(payload);
      setProfile(data);
      setSuccess('정보가 저장됐습니다.');
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setAccountSuccess('');
    setAccountError('');

    const { name, currentPassword, newPassword, confirmPassword } = accountForm;

    if (!name.trim()) {
      setAccountError('이름을 입력해주세요.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('새 비밀번호와 확인이 일치하지 않습니다.');
      return;
    }

    setAccountSaving(true);
    try {
      const payload = { name: name.trim() };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const { data } = await updateAccount(payload);
      if (newPassword) {
        logoutUser();
        navigate('/login', { state: { message: '비밀번호가 변경됐습니다. 다시 로그인해주세요.' } });
        return;
      }
      setProfile((prev) => ({ ...prev, name: data.name }));
      updateUserName(data.name);
      setAccountForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setAccountSuccess('계정 정보가 저장됐습니다.');
    } catch (err) {
      setAccountError(err.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (loading) return <div className="mypage-loading">불러오는 중...</div>;

  return (
    <div className="mypage">
      <div className="mypage-container">
        <div className="mypage-header">
          <div>
            <h1>마이페이지</h1>
            <p className="mypage-user">{profile?.name} · {profile?.userId}</p>
          </div>
          <div className="mypage-actions">
            <button className="filter-btn" onClick={() => navigate('/filter')}>
              혜택 검색하기
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        </div>

        <div className="mypage-body">
          <h2>내 정보 관리</h2>
          <p className="mypage-desc">
            저장한 정보는 혜택 검색 시 자동으로 불러와집니다.
          </p>

          {success && <div className="success-msg">{success}</div>}
          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-row">
                <label>출생연도</label>
                <select name="birthYear" value={form.birthYear} onChange={handleChange}>
                  <option value="">선택</option>
                  {BIRTH_YEARS.map((y) => (
                    <option key={y} value={y}>{y}년생</option>
                  ))}
                </select>
                {form.birthYear && (
                  <p className="hint">만 {currentYear - Number(form.birthYear)}세</p>
                )}
              </div>

              <div className="form-row">
                <label>성별</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>

              <div className="form-row">
                <label>거주 지역</label>
                <select name="region" value={form.region} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>소득 분위</label>
                <select name="incomeLevel" value={form.incomeLevel} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}분위</option>
                  ))}
                </select>
                <p className="hint">1분위(최저소득) ~ 10분위(최고소득)</p>
              </div>

              <div className="form-row">
                <label>취업 상태</label>
                <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  <option value="취업">취업 (직장인/재직자)</option>
                  <option value="실업">실업 (미취업/구직중)</option>
                  <option value="학생">학생</option>
                  <option value="자영업">자영업</option>
                </select>
              </div>

              <div className="form-row">
                <label>혼인 상태</label>
                <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  <option value="미혼">미혼</option>
                  <option value="기혼">기혼</option>
                  <option value="이혼">이혼</option>
                  <option value="사별">사별</option>
                  <option value="별거">별거</option>
                </select>
              </div>

              <div className="form-row">
                <label>가족 유형</label>
                <select name="familyType" value={form.familyType} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  <option value="1인가구">1인 가구</option>
                  <option value="다자녀">다자녀 가구 (3자녀 이상)</option>
                  <option value="한부모">한부모 가족</option>
                </select>
              </div>

              <div className="form-row">
                <label>자녀 수</label>
                <input
                  type="number"
                  name="numberOfChildren"
                  value={form.numberOfChildren}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="20"
                />
              </div>
            </div>

            <div className="form-checks-group">
              <div className="form-row form-row-check">
                <label>
                  <input
                    type="checkbox"
                    name="hasDisability"
                    checked={form.hasDisability}
                    onChange={handleChange}
                  />
                  장애인 등록 여부
                </label>
              </div>

              {form.hasDisability && (
                <div className="form-row form-row-disability-grade">
                  <label>장애 등급</label>
                  <select name="disabilityGrade" value={form.disabilityGrade} onChange={handleChange}>
                    <option value="">선택 안함</option>
                    {DISABILITY_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row form-row-check">
                <label>
                  <input
                    type="checkbox"
                    name="isForeignWorker"
                    checked={form.isForeignWorker}
                    onChange={handleChange}
                  />
                  외국인 근로자 여부
                </label>
              </div>

              <div className="form-row form-row-check">
                <label>
                  <input
                    type="checkbox"
                    name="isNorthKoreanDefector"
                    checked={form.isNorthKoreanDefector}
                    onChange={handleChange}
                  />
                  북한이탈주민 여부
                </label>
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </div>

        <div className="mypage-body account-section">
          <h2>계정 정보 수정</h2>
          <p className="mypage-desc">이름 변경 또는 비밀번호를 변경할 수 있습니다.</p>

          {accountSuccess && <div className="success-msg">{accountSuccess}</div>}
          {accountError && <div className="error-msg">{accountError}</div>}

          <form onSubmit={handleAccountSubmit} className="profile-form">
            <div className="account-group">
              <div className="account-group-label">이름</div>
              <div className="form-row">
                <label>새 이름</label>
                <input
                  type="text"
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                  placeholder="이름 입력"
                  className="account-input"
                />
              </div>
            </div>

            <div className="account-divider" />

            <div className="account-group">
              <div className="account-group-label">비밀번호 변경 <span className="account-group-optional">(선택)</span></div>
              <div className="form-row">
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={accountForm.currentPassword}
                  onChange={handleAccountChange}
                  placeholder="현재 비밀번호 입력"
                  className="account-input"
                />
              </div>
              <div className="form-row">
                <label>새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={accountForm.newPassword}
                  onChange={handleAccountChange}
                  placeholder="새 비밀번호 (6자 이상)"
                  className="account-input"
                />
              </div>
              <div className="form-row">
                <label>새 비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={accountForm.confirmPassword}
                  onChange={handleAccountChange}
                  placeholder="새 비밀번호 다시 입력"
                  className={`account-input${accountForm.newPassword && accountForm.confirmPassword && accountForm.newPassword !== accountForm.confirmPassword ? ' input-mismatch' : ''}`}
                />
                {accountForm.newPassword && accountForm.confirmPassword && accountForm.newPassword !== accountForm.confirmPassword && (
                  <span className="mismatch-hint">비밀번호가 일치하지 않습니다.</span>
                )}
              </div>
            </div>

            <button type="submit" className="save-btn" disabled={accountSaving}>
              {accountSaving ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
