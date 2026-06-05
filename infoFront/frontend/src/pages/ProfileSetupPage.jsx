import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import {
  REGIONS, DISABILITY_GRADES, EMPLOYMENT_OPTIONS, FAMILY_OPTIONS, MARITAL_OPTIONS,
  CURRENT_YEAR, BIRTH_YEARS,
} from '../constants/profileOptions';
import './ProfileSetupPage.css';

const EMPTY_FORM = {
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
};

function ProfileSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

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
    setSaving(true);
    setError('');
    try {
      await updateProfile({
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
      });
      navigate('/filter');
    } catch (err) {
      setError(err.response?.data?.message || '저장에 실패했습니다. 다시 시도해주세요.');
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup">
      <div className="profile-setup-container">
        <div className="profile-setup-intro">
          <h1>환영합니다, {user?.name}님!</h1>
          <p>
            기본 정보를 입력하시면 딱 맞는 혜택만 골라 보여드려요.<br />
            나중에 마이페이지에서 언제든 수정할 수 있습니다.
          </p>
        </div>

        <div className="profile-setup-body">
          {error && <div className="setup-error">{error}</div>}

          <form onSubmit={handleSubmit} className="setup-form">
            <div className="setup-grid">
              <div className="setup-row">
                <label>출생연도</label>
                <select name="birthYear" value={form.birthYear} onChange={handleChange}>
                  <option value="">선택</option>
                  {BIRTH_YEARS.map((y) => (
                    <option key={y} value={y}>{y}년생</option>
                  ))}
                </select>
                {form.birthYear && (
                  <p className="setup-hint">만 {CURRENT_YEAR - Number(form.birthYear)}세</p>
                )}
              </div>

              <div className="setup-row">
                <label>성별</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>

              <div className="setup-row">
                <label>거주 지역</label>
                <select name="region" value={form.region} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="setup-row">
                <label>소득 분위</label>
                <select name="incomeLevel" value={form.incomeLevel} onChange={handleChange}>
                  <option value="">선택 안함</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}분위</option>
                  ))}
                </select>
                <p className="setup-hint">1분위(최저) ~ 10분위(최고)</p>
              </div>

              <div className="setup-row">
                <label>취업 상태</label>
                <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}>
                  {EMPLOYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="setup-row">
                <label>혼인 상태</label>
                <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                  {MARITAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="setup-row">
                <label>가족 유형</label>
                <select name="familyType" value={form.familyType} onChange={handleChange}>
                  {FAMILY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="setup-row">
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

            <div className="setup-checks">
              <div className="setup-check-row">
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
                <div className="setup-row setup-disability-grade">
                  <label>장애 등급</label>
                  <select name="disabilityGrade" value={form.disabilityGrade} onChange={handleChange}>
                    <option value="">선택 안함</option>
                    {DISABILITY_GRADES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="setup-check-row">
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

              <div className="setup-check-row">
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

            <div className="setup-actions">
              <button type="submit" className="setup-save-btn" disabled={saving}>
                {saving ? '저장 중...' : '저장하고 시작하기'}
              </button>
              <button
                type="button"
                className="setup-skip-btn"
                onClick={() => navigate('/filter')}
              >
                나중에 입력하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetupPage;
