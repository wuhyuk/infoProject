import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const categories = [
    { label: '주거 지원', icon: '🏠', desc: '임대주택 · 주거급여 · 전세자금' },
    { label: '취업·고용', icon: '💼', desc: '일자리 매칭 · 직업훈련 · 고용장려금' },
    { label: '의료·건강', icon: '🏥', desc: '의료비 지원 · 건강검진 · 정신건강' },
    { label: '교육·장학', icon: '📚', desc: '장학금 · 교육비 · 학자금 대출' },
    { label: '육아·가족', icon: '👶', desc: '출산지원 · 보육료 · 아동수당' },
    { label: '장애인지원', icon: '♿', desc: '활동지원 · 이동지원 · 취업지원' },
    { label: '노인복지', icon: '👴', desc: '기초연금 · 돌봄서비스 · 의료비' },
    { label: '금융지원', icon: '💰', desc: '저금리 대출 · 보증 · 서민금융' },
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <span className="hero-badge">정부 복지 혜택 검색 서비스</span>
            <h1 className="hero-title">
              나에게 맞는<br />
              <em>정부 혜택</em>을<br />
              찾아드립니다
            </h1>
            <p className="hero-desc">
              나이, 지역, 소득, 가족 상황 등 간단한 정보를 입력하면
              받을 수 있는 혜택과 지원금을 한눈에 확인하세요.
            </p>
            <div className="hero-actions">
              <button className="cta-btn-primary" onClick={() => navigate('/filter')}>
                내 혜택 찾기
              </button>
              <button className="cta-btn-secondary" onClick={() => navigate('/announcements')}>
                정책 소식 보기
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="mock-card mc-1">
              <span className="mc-badge">주거</span>
              <p className="mc-title">청년 전세임대주택 지원</p>
              <p className="mc-org">LH 한국토지주택공사</p>
            </div>
            <div className="mock-card mc-2">
              <span className="mc-badge mc-badge--green">취업</span>
              <p className="mc-title">국민취업지원제도</p>
              <p className="mc-org">고용노동부</p>
            </div>
            <div className="mock-card mc-3">
              <span className="mc-badge mc-badge--purple">교육</span>
              <p className="mc-title">국가장학금 Ⅰ 유형</p>
              <p className="mc-org">한국장학재단</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>어떤 혜택을 찾아드리나요?</h2>
            <p>다양한 분야의 정부 지원을 검색할 수 있습니다</p>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <button
                key={cat.label}
                className="category-item"
                onClick={() => navigate('/filter')}
              >
                <span className="cat-icon">{cat.icon}</span>
                <div className="cat-info">
                  <strong className="cat-name">{cat.label}</strong>
                  <span className="cat-desc">{cat.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="section-inner">
          <div className="section-header">
            <h2>이용 방법</h2>
            <p>3단계로 맞춤 혜택을 확인하세요</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div className="step-body">
                <strong>정보 입력</strong>
                <p>나이, 지역, 소득 등 기본 정보를 입력합니다</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-num">02</div>
              <div className="step-body">
                <strong>자동 필터링</strong>
                <p>입력한 조건에 맞는 혜택이 자동으로 선별됩니다</p>
              </div>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-num">03</div>
              <div className="step-body">
                <strong>바로 신청</strong>
                <p>원하는 혜택을 확인하고 신청 페이지로 이동합니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
