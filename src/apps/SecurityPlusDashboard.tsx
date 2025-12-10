import React from 'react';

// Example weights for Security+ domains (adjust as needed)
const domainWeights: Record<string, number> = {
  ThreatsAttacksVulnerabilities: 0.21,
  TechnologiesAndTools: 0.22,
  ArchitectureAndDesign: 0.15,
  IdentityAndAccessManagement: 0.16,
  RiskManagement: 0.14,
  CryptographyAndPKI: 0.12,
};

const userScores: Record<string, number> = {
  ThreatsAttacksVulnerabilities: 0.7,
  TechnologiesAndTools: 0.8,
  ArchitectureAndDesign: 0.6,
  IdentityAndAccessManagement: 0.5,
  RiskManagement: 0.9,
  CryptographyAndPKI: 0.75,
};

const totalWeight = Object.values(domainWeights).reduce((a, b) => a + b, 0);
const weightedScore = Object.keys(domainWeights).reduce(
  (sum, domain) => sum + (userScores[domain] || 0) * domainWeights[domain],
  0
);
const competencyPercent = Math.round((weightedScore / totalWeight) * 100);

const SecurityPlusDashboard: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <h2>Your Security+ Competency</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#357ae8', marginBottom: '1rem' }}>
        {competencyPercent}%
      </div>
      <div style={{ background: '#eee', borderRadius: 12, height: 32, width: '100%', boxShadow: '0 2px 8px rgba(53,122,232,0.08)' }}>
        <div
          style={{
            height: '100%',
            width: `${competencyPercent}%`,
            background: 'linear-gradient(90deg, #357ae8 0%, #43e97b 100%)',
            borderRadius: 12,
            transition: 'width 0.5s',
          }}
        />
      </div>
      <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        <h4>Domain Breakdown</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {Object.keys(domainWeights).map(domain => (
            <li key={domain} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>{domain.replace(/([A-Z])/g, ' $1').trim()}:</span>
              {' '}
              <span style={{ color: '#357ae8' }}>{Math.round((userScores[domain] || 0) * 100)}%</span>
              {' '}<span style={{ color: '#888', fontSize: '0.9em' }}>(Weight: {Math.round(domainWeights[domain] * 100)}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SecurityPlusDashboard;
