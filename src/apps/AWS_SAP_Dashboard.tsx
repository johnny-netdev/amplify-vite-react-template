import React, { useState } from 'react';
import { useVaultEngine, DomainData } from '../utils/vaultEngine';
import { AWS_SAP_RAW_DATA, AWS_COLORS } from '../aws/constant';
import ActionTerminal from '../components/terminal/ActionTerminal';

// AWS THEME CONSTANTS
const AWS_ORANGE = '#FF9900';
// const AWS_DEEP_SQUID = '#232F3E';

interface AWSSAPDashboardProps {
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const AWSSAPDashboard: React.FC<AWSSAPDashboardProps> = ({ preLoadedDrillId, onDrillStarted }) => {
  const [startTime] = useState(Date.now());

  const { 
    competencyScore, 
    fatigueString, 
    stabilityLabel 
  } = useVaultEngine(AWS_SAP_RAW_DATA, startTime);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (65%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // AWS_SAP_C02_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            <span style={{...styles.value, color: AWS_ORANGE}}>{fatigueString}</span>
          </div>
        </header>

        {/* Metric Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>WEIGHTED_COMPETENCY</div>
            <div style={{...styles.metricValue, color: AWS_ORANGE}}>{competencyScore}%</div>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill, 
                width: `${competencyScore}%`,
                background: AWS_ORANGE,
                boxShadow: `0 0 10px ${AWS_ORANGE}`
              }} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>ARCHITECT_STATUS</div>
            <div style={{...styles.metricValue, color: '#FFFFFF'}}>{stabilityLabel}</div>
            <div style={styles.footer}>AWS Certified Solutions Architect - Pro</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div style={styles.domainGrid}>
          {AWS_SAP_RAW_DATA.map((domain: DomainData, i: number) => (
            <div 
              key={domain.id} 
              style={{
                ...styles.domainCard,
                borderLeft: `4px solid ${AWS_COLORS[domain.id] || AWS_ORANGE}`
              }}
            >
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>DOMAIN_0{i + 1}</span>
                <span style={styles.domainName}>{domain.name.toUpperCase()}</span>
                <span style={styles.weightLabel}>Weight: {Math.round(domain.weight * 100)}%</span>
              </div>
              <div style={{
                ...styles.status,
                color: AWS_COLORS[domain.id] || AWS_ORANGE,
                borderColor: AWS_COLORS[domain.id] || AWS_ORANGE
              }}>
                {Math.round(domain.userScore * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: ACTION TERMINAL (35%) --- */}
      <div style={styles.rightColumn}>
        {/* Swapped static buttons for the Live Action Terminal */}
        <ActionTerminal 
          preLoadedDrillId={preLoadedDrillId} 
          onDrillStarted={onDrillStarted}
        />
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', minHeight: '80vh', fontFamily: 'monospace' },
  leftColumn: { flex: '0 0 65%', padding: '10px' },
  rightColumn: { 
    flex: '0 0 35%', 
    padding: '10px', 
    borderLeft: '1px solid #222', 
    background: 'rgba(255, 153, 0, 0.02)', // Subtle AWS Orange tint
    borderRadius: '4px'
  },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' },
  title: { color: AWS_ORANGE, margin: 0, fontSize: '1.1rem', letterSpacing: '1px' },
  burnoutMonitor: { color: '#666', fontSize: '0.75rem' },
  label: { marginRight: '5px' },
  value: { fontWeight: 'bold' as const },
  metricsRow: { display: 'grid' as const, gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #222', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#888', marginBottom: '10px', letterSpacing: '1px' },
  metricValue: { fontSize: '1.8rem', fontWeight: 'bold' as const },
  progressBar: { width: '100%', height: '4px', background: '#111', marginTop: '10px' },
  progressFill: { height: '100%', transition: 'width 1s ease-in-out' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid' as const, gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #222', padding: '15px', display: 'flex' as const, justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10, 10, 10, 0.8)' },
  domainInfo: { display: 'flex' as const, flexDirection: 'column' as const },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#eee', letterSpacing: '1px' },
  weightLabel: { fontSize: '0.6rem', color: '#333', marginTop: '4px' },
  status: { fontSize: '0.8rem', border: '1px solid', padding: '4px 10px', background: 'rgba(0,0,0,0.5)' },
};

export default AWSSAPDashboard;