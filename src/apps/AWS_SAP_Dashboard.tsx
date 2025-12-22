import React from 'react';

// AWS SA Pro domains and weights (SAP-C02)
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

const AWSSAPDashboard: React.FC = () => {
  // Math Engine Calculations
  const totalWeight = Object.values(domainWeights).reduce((a, b) => a + b, 0);
  const weightedScore = Object.keys(domainWeights).reduce(
    (sum, domain) => sum + (userScores[domain] || 0) * domainWeights[domain],
    0
  );
  const competencyPercent = Math.round((weightedScore / totalWeight) * 100);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (70%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // AWS_SAP_C02_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            <span style={styles.value}>NOMINAL (3%)</span>
          </div>
        </header>

        {/* Metric Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>WEIGHTED_COMPETENCY</div>
            <div style={styles.metricValue}>{competencyPercent}%</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${competencyPercent}%`}} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>ARCHITECT_STATUS</div>
            <div style={{...styles.metricValue, color: '#43e97b'}}>PROFESSIONAL</div>
            <div style={styles.footer}>AWS Certified Solutions Architect - Pro</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div style={styles.domainGrid}>
          {Object.keys(domainWeights).map((domain, i) => (
            <div key={domain} style={styles.domainCard}>
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>DOMAIN_0{i + 1}</span>
                <span style={styles.domainName}>
                  {(() => {
                    switch(domain) {
                      case 'DesignSolutionsForOrganizationalComplexity': return 'Design for Org Complexity';
                      case 'DesignForNewSolutions': return 'Design for New Solutions';
                      case 'ContinuousImprovementForExistingSolutions': return 'Continuous Improvement';
                      case 'AccelerateWorkloadMigrationAndModernization': return 'Migration & Modernization';
                      default: return domain;
                    }
                  })().toUpperCase()}
                </span>
                <span style={styles.weightLabel}>Weight: {Math.round(domainWeights[domain] * 100)}%</span>
              </div>
              <div style={styles.status}>
                {Math.round((userScores[domain] || 0) * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: TEST ENGINE TERMINAL (30%) --- */}
      <div style={styles.rightColumn}>
        <div style={styles.terminalHeader}>ACTION_TERMINAL</div>
        <div style={styles.terminalBody}>
          <button style={styles.testButton}>[ RUN_SAP_PRACTICE_EXAM ]</button>
          <button style={styles.testButton}>[ ARCHITECTURE_SCENARIO_DRILL ]</button>
          <button style={styles.testButton}>[ WHITE_PAPER_RECALL ]</button>
          <button style={styles.testButton}>[ SERVICE_QUOTA_STRESS_TEST ]</button>
          
          <div style={styles.terminalFooter}>
            AWAITING_OPERATOR_INPUT...
            <br />
            TARGET_CERT: AWS_SAP_C02
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: { display: 'flex', gap: '20px', width: '100%', minHeight: '80vh', fontFamily: 'monospace' },
  leftColumn: { flex: '0 0 70%', padding: '10px' },
  rightColumn: { flex: '0 0 30%', padding: '20px', borderLeft: '1px solid #333', background: 'rgba(0, 255, 65, 0.02)' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' },
  title: { color: '#00ff41', margin: 0, fontSize: '1.2rem' },
  burnoutMonitor: { color: '#888', fontSize: '0.8rem' },
  label: { marginRight: '5px' },
  value: { color: '#00ff41', fontWeight: 'bold' as const },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(0, 255, 65, 0.05)', border: '1px solid #333', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#666', marginBottom: '10px' },
  metricValue: { fontSize: '1.8rem', color: '#00ff41', fontWeight: 'bold' as const },
  progressBar: { width: '100%', height: '4px', background: '#111', marginTop: '10px' },
  progressFill: { height: '100%', background: '#00ff41' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #222', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' },
  domainInfo: { display: 'flex', flexDirection: 'column' as const },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#aaa', letterSpacing: '1px' },
  weightLabel: { fontSize: '0.6rem', color: '#555', marginTop: '4px' },
  status: { fontSize: '0.9rem', color: '#00ff41', border: '1px solid #004400', padding: '4px 10px', background: 'black' },
  terminalHeader: { color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px' },
  terminalBody: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  testButton: { background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', padding: '15px', textAlign: 'left' as const, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace' },
  terminalFooter: { marginTop: '30px', color: '#333', fontSize: '0.7rem', lineHeight: '1.5' }
};

export default AWSSAPDashboard;