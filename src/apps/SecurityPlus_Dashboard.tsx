import React, { useState } from 'react';
import { useVaultEngine } from '../utils/vaultEngine';
import { SEC_PLUS_RAW_DATA, SEC_PLUS_COLORS } from '../securityplus/constant';

const SecPlusDashboard: React.FC = () => {
  const [startTime] = useState(Date.now());

  const { 
    competencyScore, 
    fatigueString, 
    stabilityLabel 
  } = useVaultEngine(SEC_PLUS_RAW_DATA, startTime);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (70%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // SECURITY+_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            <span style={styles.value}>{fatigueString}</span>
          </div>
        </header>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>OVERALL_STABILITY</div>
            <div style={styles.metricValue}>{competencyScore}%</div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${competencyScore}%` }} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>CORE_COMPETENCY</div>
            <div style={styles.metricValue}>{stabilityLabel}</div>
            <div style={styles.footer}>SY0-701 READINESS_PROTOCOL</div>
          </div>
        </div>

        <div style={styles.domainGrid}>
          {SEC_PLUS_RAW_DATA.map((domain, i) => (
            <div 
              key={domain.id} 
              style={{
                ...styles.domainCard,
                borderLeft: `4px solid ${SEC_PLUS_COLORS[domain.id] || '#333'}`
              }}
            >
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>MODULE_0{i + 1}</span>
                <span style={styles.domainName}>{domain.name.toUpperCase()}</span>
              </div>
              <div style={{
                ...styles.status,
                color: SEC_PLUS_COLORS[domain.id],
                borderColor: SEC_PLUS_COLORS[domain.id]
              }}>
                {Math.round(domain.userScore * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: TEST ENGINE TERMINAL (30%) --- */}
      <div style={styles.rightColumn}>
        <div style={styles.terminalHeader}>ACTION_TERMINAL</div>
        <div style={styles.terminalBody}>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#00ff41')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            [ START_PRACTICE_EXAM ]
          </button>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#00ff41')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            [ TIMED_DRILL_MODE ]
          </button>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#00ff41')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            [ DOMAIN_STRESS_TEST ]
          </button>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#00ff41')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#1a1a1a')}
          >
            [ FLASHCARD_RECALL ]
          </button>
          
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
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', minHeight: '80vh', fontFamily: 'monospace' },
  leftColumn: { flex: '0 0 70%', padding: '10px' },
  rightColumn: { flex: '0 0 30%', padding: '10px', borderLeft: '1px solid #111', background: 'rgba(0, 255, 65, 0.02)' },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #111', paddingBottom: '10px' },
  title: { color: '#00ff41', margin: 0, fontSize: '1.2rem', textShadow: '0 0 5px rgba(0, 255, 65, 0.3)' },
  burnoutMonitor: { color: '#888', fontSize: '0.8rem' },
  label: { marginRight: '5px' },
  value: { color: '#00ff41', fontWeight: 'bold' as const },
  metricsRow: { display: 'grid' as const, gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(0, 255, 65, 0.03)', border: '1px solid #111', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#666', marginBottom: '10px', letterSpacing: '1px' },
  metricValue: { fontSize: '1.8rem', color: '#00ff41', fontWeight: 'bold' as const },
  progressBar: { width: '100%', height: '4px', background: '#0a0a0a', marginTop: '10px' },
  progressFill: { height: '100%', background: '#00ff41', boxShadow: '0 0 10px #00ff41', transition: 'width 1s ease-in-out' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid' as const, gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #111', padding: '15px', display: 'flex' as const, justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 5, 5, 0.5)' },
  domainInfo: { display: 'flex' as const, flexDirection: 'column' as const },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#aaa', letterSpacing: '1px' },
  status: { fontSize: '0.7rem', border: '1px solid', padding: '4px 10px', background: 'rgba(0, 255, 65, 0.02)' },
  // --- FIXED: ADDED MISSING STYLES BELOW ---
  terminalHeader: { color: '#444', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '5px' },
  terminalBody: { display: 'flex' as const, flexDirection: 'column' as const, gap: '15px' },
  testButton: { 
    background: 'transparent', 
    color: '#00ff41', 
    border: '1px solid #1a1a1a', 
    padding: '15px', 
    textAlign: 'left' as const, 
    cursor: 'pointer', 
    fontSize: '0.8rem', 
    fontFamily: 'monospace',
    transition: 'all 0.2s ease'
  },
  terminalFooter: { marginTop: '30px', color: '#333', fontSize: '0.7rem', lineHeight: '1.4' }
};

export default SecPlusDashboard;