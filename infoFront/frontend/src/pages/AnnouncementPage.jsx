import { useEffect, useMemo, useState } from 'react';
import { getAnnouncements } from '../api/benefitApi';
import './AnnouncementPage.css';

// 필터 비교 기준 순서 (영어 코드) — 한글 인코딩 이슈 없음
const DEPT_ORDER = ['HEALTH', 'EMPLOYMENT', 'LAND', 'EDUCATION', 'GENDER', 'FINANCE', 'ADMIN', 'SME'];

// 영어 코드 → 한국어 표시명 (UI 출력 전용)
const CODE_TO_KR = {
  HEALTH:     '보건복지부',
  EMPLOYMENT: '고용노동부',
  FINANCE:    '금융위원회',
  LAND:       '국토교통부',
  GENDER:     '여성가족부',
  EDUCATION:  '교육부',
  ADMIN:      '행정안전부',
  SME:        '중소벤처기업부',
};

// 영어 코드 → 색상
const DEPT_COLORS = {
  HEALTH:     '#1976d2',
  EMPLOYMENT: '#388e3c',
  FINANCE:    '#f57c00',
  LAND:       '#7b1fa2',
  GENDER:     '#c2185b',
  EDUCATION:  '#0288d1',
  ADMIN:      '#00838f',
  SME:        '#e65100',
};

const getDeptColor = (code) => DEPT_COLORS[code] ?? '#546e7a';
const getKrName   = (code) => CODE_TO_KR[code] ?? code;

function AnnouncementPage() {
  const [news, setNews]             = useState([]);
  const [activeDept, setActiveDept] = useState('ALL');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getAnnouncements(30)
      .then(({ data }) => setNews(data))
      .catch(() => setError('공지 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  // 검색어 필터 (빈 문자열이면 전체 news 그대로 반환)
  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return news;
    return news.filter((n) =>
      n.title?.toLowerCase().includes(q) ||
      n.subTitle?.toLowerCase().includes(q)
    );
  }, [news, searchQuery]);

  // 데이터에 실제 존재하는 deptCode 수집 → DEPT_ORDER 순으로 정렬
  const availableDepts = useMemo(() => {
    const existing = new Set(searchFiltered.map((n) => n.deptCode).filter(Boolean));
    const ordered  = DEPT_ORDER.filter((code) => existing.has(code));
    const others   = [...existing].filter((code) => !DEPT_ORDER.includes(code)).sort();
    return ['ALL', ...ordered, ...others];
  }, [searchFiltered]);

  // 부처별 기사 수 (영어 코드 기준)
  const countByDept = useMemo(() => {
    const map = {};
    searchFiltered.forEach((n) => {
      const code = n.deptCode || '(unknown)';
      map[code] = (map[code] ?? 0) + 1;
    });
    return map;
  }, [searchFiltered]);

  // 필터링: deptCode (영어) 완전 일치 비교 — 한글 비교 없음
  const filtered = useMemo(() => {
    if (activeDept === 'ALL') return searchFiltered;
    return searchFiltered.filter((n) => n.deptCode === activeDept);
  }, [searchFiltered, activeDept]);

  return (
    <div className="announce-page">
      <div className="announce-header">
        <div className="announce-header-inner">
          <h1>정책 소식</h1>
          <p>최신 정부 복지·지원 정책 보도자료를 확인하세요.</p>
        </div>
      </div>

      <div className="announce-body">
        {/* 검색 바 */}
        {!loading && news.length > 0 && (
          <div className="announce-search-wrap">
            <input
              type="text"
              className="announce-search-input"
              placeholder="제목, 내용으로 검색..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveDept('ALL'); }}
            />
            {searchQuery && (
              <button
                className="announce-search-clear"
                onClick={() => { setSearchQuery(''); setActiveDept('ALL'); }}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* 부처 필터 */}
        {!loading && news.length > 0 && (
          <div className="dept-filter">
            {availableDepts.map((code) => {
              const isActive = activeDept === code;
              const label    = code === 'ALL' ? '전체' : getKrName(code);
              const count    = code === 'ALL' ? searchFiltered.length : (countByDept[code] ?? 0);
              return (
                <button
                  key={code}
                  className={`dept-btn ${isActive ? 'active' : ''}`}
                  style={
                    isActive && code !== 'ALL'
                      ? { background: getDeptColor(code), borderColor: getDeptColor(code), color: '#fff' }
                      : {}
                  }
                  onClick={() => setActiveDept(code)}
                >
                  {label}
                  <span className="dept-count">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading && <div className="announce-status">불러오는 중...</div>}
        {error   && <div className="announce-status error">{error}</div>}

        {!loading && !error && (
          filtered.length === 0 ? (
            <div className="announce-status">
              {news.length === 0
                ? 'API 연동 후 최신 정책 소식이 표시됩니다.'
                : searchQuery
                ? `"${searchQuery}" 검색 결과가 없습니다.`
                : `${getKrName(activeDept)} 관련 소식이 없습니다.`}
            </div>
          ) : (
            <>
              {activeDept !== 'ALL' && (
                <div
                  className="filter-result-hint"
                  style={{ borderLeft: `4px solid ${getDeptColor(activeDept)}` }}
                >
                  <span
                    className="filter-active-badge"
                    style={{ background: getDeptColor(activeDept) }}
                  >
                    {getKrName(activeDept)}
                  </span>
                  <span>소식 {filtered.length}건을 표시 중입니다.</span>
                  <button
                    className="filter-clear-btn"
                    onClick={() => setActiveDept('ALL')}
                  >
                    전체 보기
                  </button>
                </div>
              )}
              <div className="news-list">
                {filtered.map((item, idx) => {
                  const deptKr   = (item.department ?? '').trim();
                  const deptCode = item.deptCode ?? '';
                  return (
                    <div key={idx} className="news-card">
                      <div className="news-meta">
                        {deptCode && (
                          <span
                            className={`news-dept${activeDept === deptCode ? ' news-dept--active' : ''}`}
                            style={{ background: getDeptColor(deptCode) }}
                            onClick={() => setActiveDept(activeDept === deptCode ? 'ALL' : deptCode)}
                            title={activeDept === deptCode ? '전체 보기' : `${deptKr} 소식만 보기`}
                          >
                            {deptKr || getKrName(deptCode)}
                          </span>
                        )}
                        <span className="news-date">{item.date}</span>
                      </div>

                      <h3 className="news-title">{item.title}</h3>

                      {item.subTitle && (
                        <p className="news-summary">{item.subTitle}</p>
                      )}

                      <div className="news-footer">
                        <a
                          href={item.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detail-btn"
                        >
                          자세히 보기 →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}

export default AnnouncementPage;
