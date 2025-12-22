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
    <div style={styles.container}>
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

      {/* Domains */}
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
  );
};

const styles = {
  container: { padding: '10px', fontFamily: 'monospace' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' },
  title: { color: '#00ff41', margin: 0, fontSize: '1.2rem' },
  burnoutMonitor: { color: '#888', fontSize: '0.8rem' },
  label: { marginRight: '5px' },
  value: { color: '#00ff41', fontWeight: 'bold' },
  metricsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(0, 255, 65, 0.05)', border: '1px solid #333', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#666', marginBottom: '10px' },
  metricValue: { fontSize: '1.8rem', color: '#00ff41', fontWeight: 'bold' },
  progressBar: { width: '100%', height: '4px', background: '#111', marginTop: '10px' },
  progressFill: { height: '100%', background: '#00ff41' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #222', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)' },
  domainInfo: { display: 'flex', flexDirection: 'column' as const },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#aaa', letterSpacing: '1px' },
  status: { fontSize: '0.6rem', color: '#00ff41', border: '1px solid #004400', padding: '2px 8px' }
};

export default SecPlusDashboard;