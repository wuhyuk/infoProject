import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminContext';
import { isTokenValid } from '../utils/jwtUtils';
import {
  getAdminBenefits, createBenefit, updateBenefit, deleteBenefit, syncBenefits,
  getAdminUsers, deleteUser, getAdminStats,
} from '../api/adminApi';
import './AdminPage.css';

const CATEGORIES = ['주거', '취업·고용', '교육·장학', '의료·건강', '육아·가족', '장애인지원', '노인복지', '금융지원', '세금혜택', '생활지원'];
const EMPLOYMENT_OPTIONS = ['', '취업', '실업', '학생', '자영업'];
const FAMILY_OPTIONS = ['', '1인가구', '다자녀', '한부모'];
const GENDER_OPTIONS = ['', '남성', '여성'];
const DISABILITY_GRADE_OPTIONS = ['', '경증', '중증'];

const EMPTY_BENEFIT = {
  title: '', category: '주거', description: '', minAge: '', maxAge: '',
  targetRegion: '전국', maxIncomeLevel: '', employmentStatus: '',
  requiresDisability: false, familyType: '', requiresGender: '',
  requiresForeignWorker: false, requiresNorthKorean: false,
  disabilityGrade: '', minChildren: '', applyUrl: '', organization: '',
};

// ─── 혜택 관리 ───────────────────────────────────────────────────────────────

function SourceBadge({ source }) {
  if (source === 'api')    return <span className="source-badge source-api">공공API</span>;
  if (source === 'manual') return <span className="source-badge source-manual">수동</span>;
  return <span className="source-badge source-seed">기본</span>;
}

function BenefitManagement() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BENEFIT);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminBenefits();
      setBenefits(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_BENEFIT); setModalOpen(true); };
  const openEdit = (b) => {
    setEditing(b.id);
    setForm({
      title: b.title ?? '', category: b.category ?? '주거', description: b.description ?? '',
      minAge: b.minAge ?? '', maxAge: b.maxAge ?? '', targetRegion: b.targetRegion ?? '전국',
      maxIncomeLevel: b.maxIncomeLevel ?? '', employmentStatus: b.employmentStatus ?? '',
      requiresDisability: b.requiresDisability ?? false, familyType: b.familyType ?? '',
      requiresGender: b.requiresGender ?? '', requiresForeignWorker: b.requiresForeignWorker ?? false,
      requiresNorthKorean: b.requiresNorthKorean ?? false, disabilityGrade: b.disabilityGrade ?? '',
      minChildren: b.minChildren ?? '', applyUrl: b.applyUrl ?? '', organization: b.organization ?? '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (b) => {
    const msg = b.source === 'api'
      ? 'API 출처 혜택은 다음 동기화 시 다시 추가될 수 있습니다. 그래도 삭제하시겠습니까?'
      : '이 혜택을 삭제하시겠습니까?';
    if (!window.confirm(msg)) return;
    try {
      await deleteBenefit(b.id);
      load();
    } catch {
      alert('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const { data } = await syncBenefits();
      setSyncMsg(`동기화 완료 — 신규 ${data.created}건 / 갱신 ${data.updated}건`);
      load();
    } catch {
      setSyncMsg('동기화 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      minAge: form.minAge === '' ? null : Number(form.minAge),
      maxAge: form.maxAge === '' ? null : Number(form.maxAge),
      maxIncomeLevel: form.maxIncomeLevel === '' ? null : Number(form.maxIncomeLevel),
      minChildren: form.minChildren === '' ? null : Number(form.minChildren),
    };
    try {
      if (editing) await updateBenefit(editing, payload);
      else await createBenefit(payload);
      setModalOpen(false);
      load();
    } catch {
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = benefits.filter((b) =>
    b.title?.includes(search) || b.category?.includes(search) || b.organization?.includes(search)
  );

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>혜택 관리</h2>
          <p className="section-desc">총 {benefits.length}개의 혜택이 등록되어 있습니다.</p>
        </div>
        <div className="section-actions">
          <input
            className="search-input"
            placeholder="제목·카테고리·기관 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-sync" onClick={handleSync} disabled={syncing}>
            {syncing ? '동기화 중...' : '공공API 동기화'}
          </button>
          {syncMsg && <span className="sync-msg">{syncMsg}</span>}
          <button className="btn-primary" onClick={openCreate}>+ 새 혜택 추가</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-msg">불러오는 중...</div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>제목</th><th>카테고리</th><th>출처</th><th>지역</th><th>소득분위</th><th>기관</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="td-id">{b.id}</td>
                  <td className="td-title">{b.title}</td>
                  <td><span className="tag">{b.category}</span></td>
                  <td><SourceBadge source={b.source} /></td>
                  <td>{b.targetRegion ?? '전국'}</td>
                  <td>{b.maxIncomeLevel ? `${b.maxIncomeLevel}분위 이하` : '제한 없음'}</td>
                  <td>{b.organization}</td>
                  <td className="td-actions">
                    <button className="btn-edit" onClick={() => openEdit(b)}>수정</button>
                    <button className="btn-delete" onClick={() => handleDelete(b)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-msg">검색 결과가 없습니다.</div>}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? '혜택 수정' : '새 혜택 추가'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            {editing && benefits.find(b => b.id === editing)?.source === 'api' && (
              <div className="edit-api-notice">
                공공API 출처 혜택입니다. 수정하면 이후 자동 동기화에서 제외되어 수동 관리됩니다.
              </div>
            )}
            <form onSubmit={handleSave} className="benefit-form">
              <div className="form-grid">
                <div className="form-col-full">
                  <label>제목 <span className="req">*</span></label>
                  <input value={form.title} onChange={(e) => setField('title', e.target.value)} required />
                </div>
                <div>
                  <label>카테고리 <span className="req">*</span></label>
                  <select value={form.category} onChange={(e) => setField('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label>기관 <span className="req">*</span></label>
                  <input value={form.organization} onChange={(e) => setField('organization', e.target.value)} required />
                </div>
                <div className="form-col-full">
                  <label>설명</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
                <div>
                  <label>최소 나이</label>
                  <input type="number" min={0} max={120} value={form.minAge} onChange={(e) => setField('minAge', e.target.value)} placeholder="미입력 시 제한 없음" />
                </div>
                <div>
                  <label>최대 나이</label>
                  <input type="number" min={0} max={120} value={form.maxAge} onChange={(e) => setField('maxAge', e.target.value)} placeholder="미입력 시 제한 없음" />
                </div>
                <div>
                  <label>대상 지역</label>
                  <input value={form.targetRegion} onChange={(e) => setField('targetRegion', e.target.value)} placeholder="전국" />
                </div>
                <div>
                  <label>소득분위 (1~10)</label>
                  <input type="number" min={1} max={10} value={form.maxIncomeLevel} onChange={(e) => setField('maxIncomeLevel', e.target.value)} placeholder="미입력 시 제한 없음" />
                </div>
                <div>
                  <label>취업 상태</label>
                  <select value={form.employmentStatus} onChange={(e) => setField('employmentStatus', e.target.value)}>
                    {EMPLOYMENT_OPTIONS.map((o) => <option key={o} value={o}>{o || '제한 없음'}</option>)}
                  </select>
                </div>
                <div>
                  <label>가족 형태</label>
                  <select value={form.familyType} onChange={(e) => setField('familyType', e.target.value)}>
                    {FAMILY_OPTIONS.map((o) => <option key={o} value={o}>{o || '제한 없음'}</option>)}
                  </select>
                </div>
                <div>
                  <label>성별 조건</label>
                  <select value={form.requiresGender} onChange={(e) => setField('requiresGender', e.target.value)}>
                    {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o || '제한 없음'}</option>)}
                  </select>
                </div>
                <div>
                  <label>장애 등급</label>
                  <select value={form.disabilityGrade} onChange={(e) => setField('disabilityGrade', e.target.value)}>
                    {DISABILITY_GRADE_OPTIONS.map((o) => <option key={o} value={o}>{o || '제한 없음'}</option>)}
                  </select>
                </div>
                <div>
                  <label>최소 자녀 수</label>
                  <input type="number" min={0} value={form.minChildren} onChange={(e) => setField('minChildren', e.target.value)} placeholder="미입력 시 제한 없음" />
                </div>
                <div>
                  <label>신청 URL <span className="req">*</span></label>
                  <input value={form.applyUrl} onChange={(e) => setField('applyUrl', e.target.value)} required />
                </div>
                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.requiresDisability} onChange={(e) => setField('requiresDisability', e.target.checked)} />
                    장애인 전용
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.requiresForeignWorker} onChange={(e) => setField('requiresForeignWorker', e.target.checked)} />
                    외국인 근로자 전용
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.requiresNorthKorean} onChange={(e) => setField('requiresNorthKorean', e.target.checked)} />
                    탈북민 전용
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>취소</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? '저장 중...' : editing ? '수정 완료' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 사용자 관리 ──────────────────────────────────────────────────────────────

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`"${name}" 사용자를 삭제하시겠습니까?`)) return;
    try {
      await deleteUser(id);
      load();
    } catch {
      alert('삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const filtered = users.filter(
    (u) => u.name?.includes(search) || u.userId?.includes(search)
  );

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2>사용자 관리</h2>
          <p className="section-desc">총 {users.length}명의 사용자가 가입되어 있습니다.</p>
        </div>
        <input
          className="search-input"
          placeholder="이름·아이디 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-msg">불러오는 중...</div>
      ) : (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>이름</th><th>아이디</th><th>역할</th><th>가입일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="td-id">{u.id}</td>
                  <td>{u.name}</td>
                  <td className="td-email">{u.userId}</td>
                  <td><span className={`role-tag ${u.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>{u.role}</span></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDelete(u.id, u.name)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-msg">검색 결과가 없습니다.</div>}
        </div>
      )}
    </div>
  );
}

// ─── 통계 ─────────────────────────────────────────────────────────────────────

function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-section"><div className="loading-msg">불러오는 중...</div></div>;
  if (error || !stats) return <div className="admin-section"><div className="empty-msg">통계를 불러올 수 없습니다.</div></div>;

  const maxCount = Math.max(...Object.values(stats.benefitsByCategory));

  return (
    <div className="admin-section">
      <h2>통계 · 모니터링</h2>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.totalBenefits}</div>
          <div className="stat-label">전체 혜택 수</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">전체 회원 수</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">{stats.newUsersThisWeek}</div>
          <div className="stat-label">이번 주 신규 가입</div>
        </div>
      </div>

      <div className="chart-section">
        <h3>카테고리별 혜택 현황</h3>
        <div className="bar-chart">
          {Object.entries(stats.benefitsByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <div key={cat} className="bar-row">
                <div className="bar-label">{cat}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                  <span className="bar-count">{count}개</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 관리자 페이지 ───────────────────────────────────────────────────────

const TABS = [
  { key: 'benefits', label: '혜택 관리' },
  { key: 'users', label: '사용자 관리' },
  { key: 'stats', label: '통계' },
];

function AdminPage() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('benefits');

  const token = sessionStorage.getItem('adminToken');
  const tokenValid = isTokenValid(token);

  useEffect(() => {
    if (!admin && !tokenValid) {
      navigate('/admin/login', { replace: true });
    }
  }, [admin, tokenValid, navigate]);

  // 세션 없음 → 리다이렉트 대기
  if (!admin && !tokenValid) return null;

  // 토큰은 유효하지만 context 상태가 아직 커밋되지 않은 짧은 타이밍 (로그인 직후)
  if (!admin) return <div className="loading-msg" style={{ padding: '60px', textAlign: 'center' }}>로딩 중...</div>;

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-brand">
          <span className="admin-header-icon">⚙️</span>
          <span className="admin-header-title">관리자 대시보드</span>
        </div>
        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-nav-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="admin-header-right">
          <span className="admin-user-name">{admin.name}</span>
          <button className="admin-logout-btn" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <main className="admin-body">
        {activeTab === 'benefits' && <BenefitManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'stats' && <StatsPanel />}
      </main>
    </div>
  );
}

export default AdminPage;
