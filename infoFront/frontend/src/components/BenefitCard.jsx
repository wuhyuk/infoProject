import './BenefitCard.css';

const CATEGORY_COLORS = {
  '주거': '#1B4FD8',
  '취업·고용': '#059669',
  '취업': '#059669',
  '금융': '#D97706',
  '금융지원': '#D97706',
  '복지': '#7C3AED',
  '의료·건강': '#DC2626',
  '의료': '#DC2626',
  '교육·장학': '#0891B2',
  '교육': '#0891B2',
  '육아·가족': '#EA580C',
  '노인복지': '#92400E',
  '노인': '#92400E',
  '장애인지원': '#5B21B6',
  '세금혜택': '#374151',
  '생활지원': '#0F766E',
  '교통': '#1E40AF',
};

function BenefitCard({ benefit }) {
  const color = CATEGORY_COLORS[benefit.category] || '#475569';

  return (
    <div className="benefit-card" style={{ borderLeftColor: color }}>
      <div className="card-header">
        <span className="category-badge" style={{ background: color }}>
          {benefit.category}
        </span>
        {benefit.targetSummary && (
          <span className="target-summary">{benefit.targetSummary}</span>
        )}
      </div>
      <h3 className="card-title">{benefit.title}</h3>
      {benefit.description && (
        <p className="card-description">{benefit.description}</p>
      )}
      <div className="card-footer">
        <span className="organization">{benefit.organization}</span>
        {benefit.applyUrl && (
          <a
            href={benefit.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="apply-btn"
          >
            신청하기
          </a>
        )}
      </div>
    </div>
  );
}

export default BenefitCard;
