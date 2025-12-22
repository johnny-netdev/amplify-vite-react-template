import React from 'react';

const SEC_PLUS_DOMAINS = [
  "General Security Concepts",
  "Threats, Vulnerabilities & Mitigations",
  "Security Architecture",
  "Security Operations",
  "Governance, Risk & Compliance"
];

const SecPlusDashboard: React.FC = () => {
  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (70%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // SECURITY+_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            <span style={styles.value}>NOMINAL (5%)</span>
          </div>
        </header>

        {/* Metric Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>OVERALL_STABILITY</div>
            <div style={styles.metricValue}>42%</div>
            <div style={styles.progressBar}><div style={{...styles.progressFill, width: '42%'}} /></div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>CORE_COMPETENCY</div>
            <div style={styles.metricValue}>HIGH</div>
            <div style={styles.footer}>SY0-701 Readiness: 78%</div>
          </div>
        </div>

        {/* Domains List */}
        <div style={styles.domainGrid}>
          {SEC_PLUS_DOMAINS.map((domain, i) => (
            <div key={i} style={styles.domainCard}>
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>MODULE_0{i+1}</span>
                <span style={styles.domainName}>{domain.toUpperCase()}</span>
              </div>
              <div style={styles.status}>ACTIVE</div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: TEST ENGINE TERMINAL (30%) --- */}
      <div style={styles.rightColumn}>
        <div style={styles.terminalHeader}>ACTION_TERMINAL</div>
        <div style={styles.terminalBody}>
          <button style={styles.testButton}>[ START_PRACTICE_EXAM ]</button>
          <button style={styles.testButton}>[ TIMED_DRILL_MODE ]</button>
          <button style={styles.testButton}>[ DOMAIN_STRESS_TEST ]</button>
          <button style={styles.testButton}>[ FLASHCARD_RECALL ]</button>
          
          <div style={styles.terminalFooter}>
            AWAITING_OPERATOR_INPUT...
            <br />
            TARGET_CERT: SEC+_SY0-701
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: { 
    display: 'flex', 
    gap: '20px', 
    width: '100%', 
    minHeight: '80vh', 
    fontFamily: 'monospace' 
  },
  leftColumn: { 
    flex: '0 0 70%', 
    padding: '10px' 
  },
  rightColumn: { 
    flex: '0 0 30%', 
    padding: '10px', 
    borderLeft: '1px solid #333', 
    background: 'rgba(0, 255, 65, 0.02)' 
  },
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
  status: { fontSize: '0.6rem', color: '#00ff41', border: '1px solid #004400', padding: '2px 8px' },
  
  // Right Column Specific Styles
  terminalHeader: { color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px' },
  terminalBody: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  testButton: { 
    background: 'transparent', 
    color: '#00ff41', 
    border: '1px solid #00ff41', 
    padding: '15px', 
    textAlign: 'left' as const, 
    cursor: 'pointer', 
    fontSize: '0.8rem',
    transition: '0.2s',
    fontFamily: 'monospace'
  },
  terminalFooter: { marginTop: '30px', color: '#333', fontSize: '0.7rem', lineHeight: '1.5' }
};

export default SecPlusDashboard;