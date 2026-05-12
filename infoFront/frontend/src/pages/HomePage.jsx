import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: '🏠', label: '주거 지원' },
    { icon: '💼', label: '취업·고용' },
    { icon: '🏥', label: '의료·건강' },
    { icon: '📚', label: '교육·장학' },
    { icon: '👶', label: '육아·가족' },
    { icon: '♿', label: '장애인지원' },
    { icon: '👴', label: '노인복지' },
    { icon: '💰', label: '금융지원' },
  ];

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          나에게 맞는<br />
          <span>정부 혜택</span>을 찾아드립니다
        </h1>
        <p className="hero-desc">
          나이, 지역, 소득, 가족 상황 등 간단한 정보를 입력하면<br />
          받을 수 있는 혜택과 지원금을 한눈에 확인하세요.
        </p>
        <button className="cta-btn" onClick={() => navigate('/filter')}>
          내 혜택 찾기 →
        </button>
      </section>

      <section className="features">
        <h2>어떤 혜택을 찾아드리나요?</h2>
        <div className="feature-grid">
          {features.map((f) => (
            <div key={f.label} className="feature-item">
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-label">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section">
        <h2>이용 방법</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <p>나이, 지역, 소득 등 기본 정보 입력</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <p>조건에 맞는 혜택 자동 필터링</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <p>혜택 확인 후 바로 신청</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
