import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BenefitCard from '../components/BenefitCard';
import './ResultPage.css';

const CATEGORY_ORDER = ['전체', '주거', '취업·고용', '의료·건강', '교육·장학', '육아·가족', '장애인지원', '노인복지', '금융지원', '세금혜택', '생활지원'];

function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const results = useMemo(() => state?.results ?? [], [state]);
  const profile = state?.profile ?? {};

  // 검색어 필터 (빈 문자열이면 전체 결과 그대로 반환)
  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return results;
    return results.filter((r) =>
      r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.organization?.toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  // 결과에 실제로 존재하는 카테고리만 추출 (정해진 순서 유지)
  const categories = useMemo(() => {
    const existing = new Set(searchFiltered.map((r) => r.category).filter(Boolean));
    return ['전체', ...CATEGORY_ORDER.slice(1).filter((c) => existing.has(c))];
  }, [searchFiltered]);

  // 카테고리별 개수
  const countByCategory = useMemo(() => {
    const map = { 전체: searchFiltered.length };
    searchFiltered.forEach((r) => {
      if (r.category) map[r.category] = (map[r.category] || 0) + 1;
    });
    return map;
  }, [searchFiltered]);

  if (!state?.results) {
    navigate('/filter');
    return null;
  }

  const filtered = activeCategory === '전체'
    ? searchFiltered
    : searchFiltered.filter((r) => r.category === activeCategory);

  return (
    <div className="result-page">
      {/* 헤더 */}
      <div className="result-header">
        <div className="result-header-inner">
          <div>
            <h1>검색 결과</h1>
            <p>
              <strong>{results.length}개</strong>의 혜택을 찾았습니다.
              {profile.region && ` · ${profile.region}`}
              {profile.age && ` · ${profile.age}세`}
              {profile.incomeLevel && ` · 소득 ${profile.incomeLevel}분위`}
            </p>
          </div>
          <button className="back-btn" onClick={() => navigate('/filter')}>
            ← 다시 검색
          </button>
        </div>
      </div>

      {/* 검색 바 */}
      {results.length > 0 && (
        <div className="result-search-bar">
          <div className="result-search-inner">
            <input
              type="text"
              className="result-search-input"
              placeholder="혜택 이름, 기관, 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory('전체'); }}
            />
            {searchQuery && (
              <button
                className="result-search-clear"
                onClick={() => { setSearchQuery(''); setActiveCategory('전체'); }}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 카테고리 필터 */}
      {results.length > 0 && (
        <div className="category-bar">
          <div className="category-bar-inner">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                <span className="cat-count">{countByCategory[cat] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 결과 목록 */}
      <div className="result-body">
        {results.length === 0 ? (
          <div className="empty-state">
            <p>조건에 맞는 혜택을 찾지 못했습니다.</p>
            <p>조건을 변경하거나 완화해서 다시 검색해보세요.</p>
            <button className="back-btn-center" onClick={() => navigate('/filter')}>
              조건 수정하기
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <p>"{searchQuery}"에 해당하는 혜택이 없습니다.</p>
                <button className="back-btn-center" onClick={() => setSearchQuery('')}>검색어 지우기</button>
              </>
            ) : (
              <p>이 카테고리에 해당하는 혜택이 없습니다.</p>
            )}
          </div>
        ) : (
          <>
            <p className="filtered-count">
              {searchQuery && (
                <span className="active-cat-label">"{searchQuery}"</span>
              )}
              {activeCategory !== '전체' && (
                <span className="active-cat-label">{activeCategory}</span>
              )}
              {filtered.length}개
            </p>
            <div className="benefit-grid">
              {filtered.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
