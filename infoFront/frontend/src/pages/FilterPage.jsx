import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFilteredBenefits } from '../api/benefitApi';
import { getMyProfile } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import './FilterPage.css';

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const EMPLOYMENT_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: '취업', label: '취업 (직장인/재직자)' },
  { value: '실업', label: '실업 (미취업/구직중)' },
  { value: '학생', label: '학생' },
  { value: '자영업', label: '자영업' },
];

const FAMILY_OPTIONS = [
  { value: '', label: '선택 안함' },
  { value: '1인가구', label: '1인 가구' },
  { value: '다자녀', label: '다자녀 가구 (3자녀 이상)' },
  { value: '한부모', label: '한부모 가족' },
];

const DISABILITY_GRADES = ['경증', '중증'];

// DB에 구 등급(1~6급)이 저장된 경우를 위한 하위 호환 변환
const toSeverity = (grade) => {
  if (!grade) return null;
  const n = parseInt(grade, 10);
  if (n >= 1 && n <= 3) return '중증';
  if (n >= 4 && n <= 6) return '경증';
  return grade;
};

const EMPTY_FORM = {
  age: '',
  gender: '',
  region: '',
  incomeLevel: '',
  employmentStatus: '',
  hasDisability: false,
  disabilityGrade: '',
  familyType: '',
  isForeignWorker: false,
  isNorthKoreanDefector: false,
  numberOfChildren: '',
};

function FilterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!user) return;
    setProfileLoading(true);
    getMyProfile()
      .then(({ data }) => setProfile(data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'hasDisability' && !checked) updated.disabilityGrade = '';
      return updated;
    });
  };

  const doSearch = async (payload, displayProfile) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await getFilteredBenefits(payload);
      navigate('/results', { state: { results: data, profile: displayProfile } });
    } catch {
      setError('서버와 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSearch = () => {
    const currentYear = new Date().getFullYear();
    const payload = {
      age: profile.birthYear ? currentYear - profile.birthYear : null,
      gender: profile.gender || null,
      region: profile.region || null,
      incomeLevel: profile.incomeLevel || null,
      employmentStatus: profile.employmentStatus || null,
      hasDisability: profile.hasDisability || false,
      disabilityGrade: toSeverity(profile.disabilityGrade),
      familyType: profile.familyType || null,
      isForeignWorker: profile.isForeignWorker || false,
      isNorthKoreanDefector: profile.isNorthKoreanDefector || false,
      numberOfChildren: profile.numberOfChildren ?? null,
    };
    doSearch(payload, {
      age: payload.age ? String(payload.age) : '',
      region: profile.region || '',
      incomeLevel: profile.incomeLevel ? String(profile.incomeLevel) : '',
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.age) {
      setError('나이는 필수 입력 항목입니다.');
      return;
    }
    const payload = {
      age: Number(form.age),
      gender: form.gender || null,
      region: form.region || null,
      incomeLevel: form.incomeLevel ? Number(form.incomeLevel) : null,
      employmentStatus: form.employmentStatus || null,
      hasDisability: form.hasDisability,
      disabilityGrade: form.hasDisability ? toSeverity(form.disabilityGrade) : null,
      familyType: form.familyType || null,
      isForeignWorker: form.isForeignWorker,
      isNorthKoreanDefector: form.isNorthKoreanDefector,
      numberOfChildren: form.numberOfChildren !== '' ? Number(form.numberOfChildren) : null,
    };
    doSearch(payload, form);
  };

  const currentYear = new Date().getFullYear();
  const hasProfile = profile?.birthYear || profile?.region || profile?.employmentStatus;

  // 로그인 + 프로필 로딩 중
  if (user && profileLoading) {
    return (
      <div className="filter-page">
        <div className="filter-container">
          <p className="filter-desc">내 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 + 프로필 있음: 원클릭 검색
  if (user && hasProfile) {
    return (
      <div className="filter-page">
        <div className="filter-container">
          <h1>내 맞춤 혜택 검색</h1>
          <p className="filter-desc">저장된 내 정보를 바탕으로 맞춤 혜택을 검색합니다.</p>

          <div className="profile-summary-card">
            <div className="profile-summary-header">
              <span className="profile-summary-title">검색에 사용할 내 정보</span>
              <Link to="/mypage" className="edit-profile-link">수정하기 →</Link>
            </div>
            <div className="profile-summary-grid">
              {profile.birthYear && (
                <div className="profile-summary-item">
                  <span className="summary-label">나이</span>
                  <span className="summary-value">{currentYear - profile.birthYear}세</span>
                </div>
              )}
              {profile.gender && (
                <div className="profile-summary-item">
                  <span className="summary-label">성별</span>
                  <span className="summary-value">{profile.gender}</span>
                </div>
              )}
              {profile.region && (
                <div className="profile-summary-item">
                  <span className="summary-label">지역</span>
                  <span className="summary-value">{profile.region}</span>
                </div>
              )}
              {profile.incomeLevel && (
                <div className="profile-summary-item">
                  <span className="summary-label">소득 분위</span>
                  <span className="summary-value">{profile.incomeLevel}분위</span>
                </div>
              )}
              {profile.employmentStatus && (
                <div className="profile-summary-item">
                  <span className="summary-label">취업 상태</span>
                  <span className="summary-value">{profile.employmentStatus}</span>
                </div>
              )}
              {profile.familyType && (
                <div className="profile-summary-item">
                  <span className="summary-label">가족 유형</span>
                  <span className="summary-value">{profile.familyType}</span>
                </div>
              )}
              {profile.hasDisability && (
                <div className="profile-summary-item">
                  <span className="summary-label">장애인 등록</span>
                  <span className="summary-value">
                    예{profile.disabilityGrade ? ` (${profile.disabilityGrade})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="submit-btn" onClick={handleProfileSearch} disabled={loading}>
            {loading ? '검색 중...' : '내 정보로 혜택 찾기'}
          </button>
        </div>
      </div>
    );
  }

  // 로그인 + 프로필 없음: 마이페이지 유도
  if (user && !hasProfile) {
    return (
      <div className="filter-page">
        <div className="filter-container">
          <h1>내 정보 설정 필요</h1>
          <p className="filter-desc">
            마이페이지에서 내 정보를 입력하면<br />
            맞춤 혜택을 바로 검색할 수 있어요.
          </p>
          <button className="submit-btn" onClick={() => navigate('/mypage')}>
            내 정보 입력하러 가기
          </button>
        </div>
      </div>
    );
  }

  // 비로그인: 직접 입력 폼
  return (
    <div className="filter-page">
      <div className="filter-container">
        <h1>혜택 검색</h1>
        <p className="filter-desc">
          정보를 입력하면 조건에 맞는 혜택을 찾아드립니다.{' '}
          <Link to="/login" className="login-highlight">로그인</Link>하면
          저장된 정보로 더 빠르게 검색할 수 있어요.
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleFormSubmit} className="filter-form">
          <div className="filter-grid">
            <div className="form-row">
              <label>나이 <span className="required">*</span></label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="예: 28"
                min="0"
                max="120"
              />
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
                <option value="">전국 (지역 무관)</option>
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
                {EMPLOYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>가족 유형</label>
              <select name="familyType" value={form.familyType} onChange={handleChange}>
                {FAMILY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
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

          <div className="filter-checks-group">
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
              <div className="form-row filter-disability-grade">
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '검색 중...' : '혜택 찾기'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FilterPage;
