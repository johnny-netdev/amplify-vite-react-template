import React, { useState } from 'react';
import { useVaultEngine, DomainData } from '../utils/vaultEngine';
import { AWS_SAP_RAW_DATA, AWS_COLORS, AWS_TERMINAL } from '../aws/constant';

const AWSSAPDashboard: React.FC = () => {
  // ⭐️ FIXED: Added missing startTime for the fatigue engine
  const [startTime] = useState(Date.now());

  // ⭐️ FIXED: Using the Modular Engine (Removed old manual math)
  const { 
    competencyScore, 
    fatigueString, 
    stabilityLabel 
  } = useVaultEngine(AWS_SAP_RAW_DATA, startTime);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (70%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // AWS_SAP_C02_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            {/* ⭐️ FIXED: Dynamic value from engine */}
            <span style={styles.value}>{fatigueString}</span>
          </div>
        </header>

        {/* Metric Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>WEIGHTED_COMPETENCY</div>
            <div style={styles.metricValue}>{competencyScore}%</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${competencyScore}%`}} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>ARCHITECT_STATUS</div>
            {/* ⭐️ FIXED: Dynamic label from engine */}
            <div style={{...styles.metricValue, color: '#00ff41'}}>{stabilityLabel}</div>
            <div style={styles.footer}>AWS Certified Solutions Architect - Pro</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div style={styles.domainGrid}>
          {/* ⭐️ FIXED: Mapping over AWS_SAP_RAW_DATA with proper typing */}
          {AWS_SAP_RAW_DATA.map((domain: DomainData, i: number) => (
            <div 
              key={domain.id} 
              style={{
                ...styles.domainCard,
                borderLeft: `4px solid ${AWS_COLORS[domain.id] || '#333'}`
              }}
            >
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>DOMAIN_0{i + 1}</span>
                <span style={styles.domainName}>{domain.name.toUpperCase()}</span>
                <span style={styles.weightLabel}>Weight: {Math.round(domain.weight * 100)}%</span>
              </div>
              <div style={{
                ...styles.status,
                color: AWS_COLORS[domain.id] || '#00ff41',
                borderColor: AWS_COLORS[domain.id] || '#004400'
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
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = AWS_TERMINAL.buttonBorder;
              e.currentTarget.style.backgroundColor = AWS_TERMINAL.buttonHoverBg;
              e.currentTarget.style.color = AWS_TERMINAL.buttonText;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#00ff41';
            }}
          >
            [ RUN_SAP_PRACTICE_EXAM ]
          </button>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = AWS_TERMINAL.buttonBorder;
              e.currentTarget.style.backgroundColor = AWS_TERMINAL.buttonHoverBg;
              e.currentTarget.style.color = AWS_TERMINAL.buttonText;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#00ff41';
            }}
          >
            [ ARCHITECTURE_SCENARIO_DRILL ]
          </button>
          <button 
            style={styles.testButton}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = AWS_TERMINAL.buttonBorder;
              e.currentTarget.style.backgroundColor = AWS_TERMINAL.buttonHoverBg;
              e.currentTarget.style.color = AWS_TERMINAL.buttonText;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#00ff41';
            }}
          >
            [ WHITE_PAPER_RECALL ]
          </button>
          
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
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', minHeight: '80vh', fontFamily: 'monospace' },
  leftColumn: { flex: '0 0 70%', padding: '10px' },
  rightColumn: { flex: '0 0 30%', padding: '20px', borderLeft: '1px solid #111', background: 'rgba(0, 255, 65, 0.02)' },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #111', paddingBottom: '10px' },
  title: { color: '#00ff41', margin: 0, fontSize: '1.2rem' },
  burnoutMonitor: { color: '#888', fontSize: '0.8rem' },
  label: { marginRight: '5px' },
  value: { color: '#00ff41', fontWeight: 'bold' as const },
  metricsRow: { display: 'grid' as const, gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(0, 255, 65, 0.03)', border: '1px solid #111', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#666', marginBottom: '10px' },
  metricValue: { fontSize: '1.8rem', color: '#00ff41', fontWeight: 'bold' as const },
  progressBar: { width: '100%', height: '4px', background: '#0a0a0a', marginTop: '10px' },
  progressFill: { height: '100%', background: '#00ff41', boxShadow: '0 0 10px #00ff41' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid' as const, gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #111', padding: '15px', display: 'flex' as const, justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 5, 5, 0.5)' },
  domainInfo: { display: 'flex' as const, flexDirection: 'column' as const },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#aaa', letterSpacing: '1px' },
  weightLabel: { fontSize: '0.6rem', color: '#333', marginTop: '4px' },
  status: { fontSize: '0.9rem', border: '1px solid', padding: '4px 10px', background: 'black' },
  terminalHeader: { color: '#444', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px', borderBottom: '1px solid #222' },
  terminalBody: { display: 'flex' as const, flexDirection: 'column' as const, gap: '15px' },
  testButton: { background: 'transparent', color: '#00ff41', border: '1px solid #1a1a1a', padding: '15px', textAlign: 'left' as const, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace', transition: '0.3s' },
  terminalFooter: { marginTop: '30px', color: '#222', fontSize: '0.7rem', lineHeight: '1.5' }
};

export default AWSSAPDashboard;