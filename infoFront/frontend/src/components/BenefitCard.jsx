import './BenefitCard.css';

const CATEGORY_COLORS = {
  '주거': '#1976d2',
  '취업': '#388e3c',
  '금융': '#f57c00',
  '복지': '#7b1fa2',
  '의료': '#d32f2f',
  '교육': '#0288d1',
  '노인': '#5d4037',
  '세금혜택': '#455a64',
  '생활지원': '#00796b',
  '교통': '#303f9f',
};

function BenefitCard({ benefit }) {
  const badgeColor = CATEGORY_COLORS[benefit.category] || '#546e7a';

  return (
    <div className="benefit-card">
      <div className="card-header">
        <span className="category-badge" style={{ background: badgeColor }}>
          {benefit.category}
        </span>
        <span className="target-summary">{benefit.targetSummary}</span>
      </div>
      <h3 className="card-title">{benefit.title}</h3>
      <p className="card-description">{benefit.description}</p>
      <div className="card-footer">
        <span className="organization">📋 {benefit.organization}</span>
        {benefit.applyUrl && (
          <a
            href={benefit.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-btn"
          >
            신청하기 →
          </a>
        )}
      </div>
    </div>
  );
}

export default BenefitCard;
