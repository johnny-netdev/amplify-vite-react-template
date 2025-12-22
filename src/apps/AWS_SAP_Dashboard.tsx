import React from 'react';

// AWS SA Pro domains and weights (2023)
const domainWeights: Record<string, number> = {
  DesignSolutionsForOrganizationalComplexity: 0.26,
  DesignForNewSolutions: 0.29,
  ContinuousImprovementForExistingSolutions: 0.25,
  AccelerateWorkloadMigrationAndModernization: 0.20,
};

const userScores: Record<string, number> = {
  DesignSolutionsForOrganizationalComplexity: 0.8,
  DesignForNewSolutions: 0.7,
  ContinuousImprovementForExistingSolutions: 0.6,
  AccelerateWorkloadMigrationAndModernization: 0.9,
};

const totalWeight = Object.values(domainWeights).reduce((a, b) => a + b, 0);
const weightedScore = Object.keys(domainWeights).reduce(
  (sum, domain) => sum + (userScores[domain] || 0) * domainWeights[domain],
  0
);
const competencyPercent = Math.round((weightedScore / totalWeight) * 100);

const AWSSAPDashboard: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      <h2>Your AWS SA Pro Competency</h2>
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
              <span style={{ fontWeight: 500 }}>
                {(() => {
                  switch(domain) {
                    case 'DesignSolutionsForOrganizationalComplexity': return 'Design Solutions for Organizational Complexity';
                    case 'DesignForNewSolutions': return 'Design for New Solutions';
                    case 'ContinuousImprovementForExistingSolutions': return 'Continuous Improvement for Existing Solutions';
                    case 'AccelerateWorkloadMigrationAndModernization': return 'Accelerate Workload Migration and Modernization';
                    default: return domain;
                  }
                })()}
              </span>:
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

export default AWSSAPDashboard;
