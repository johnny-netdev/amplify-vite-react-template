import React, { useState } from 'react';
import { useVaultEngine } from '../utils/vaultEngine';
import { SEC_PLUS_RAW_DATA, SEC_PLUS_COLORS } from '../securityplus/constant';
import ActionTerminal from '../components/terminal/ActionTerminal';

// CompTIA Brand Palette
const COMPTIA_ORANGE = '#ff6600';
const COMPTIA_BLUE = '#0073ae';

interface SecPlusDashboardProps {
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const SecPlusDashboard: React.FC<SecPlusDashboardProps> = ({ preLoadedDrillId, onDrillStarted }) => {
  const [startTime] = useState(Date.now());

  const { 
    competencyScore, 
    fatigueString, 
    stabilityLabel 
  } = useVaultEngine(SEC_PLUS_RAW_DATA, startTime);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (65%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // SECURITY+_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_FATIGUE:</span>
            <span style={{...styles.value, color: COMPTIA_ORANGE}}>{fatigueString}</span>
          </div>
        </header>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>OVERALL_STABILITY</div>
            <div style={{...styles.metricValue, color: COMPTIA_ORANGE}}>{competencyScore}%</div>
            <div style={styles.progressBar}>
              <div style={{ 
                ...styles.progressFill, 
                width: `${competencyScore}%`,
                background: COMPTIA_ORANGE,
                boxShadow: `0 0 10px ${COMPTIA_ORANGE}`
              }} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>CORE_COMPETENCY</div>
            <div style={{...styles.metricValue, color: COMPTIA_BLUE}}>{stabilityLabel}</div>
            <div style={styles.footer}>SY0-701 READINESS_PROTOCOL</div>
          </div>
        </div>

        <div style={styles.domainGrid}>
          {SEC_PLUS_RAW_DATA.map((domain, i) => (
            <div 
              key={domain.id} 
              style={{
                ...styles.domainCard,
                borderLeft: `4px solid ${SEC_PLUS_COLORS[domain.id] || COMPTIA_BLUE}`
              }}
            >
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>MODULE_0{i + 1}</span>
                <span style={styles.domainName}>{domain.name.toUpperCase()}</span>
              </div>
              <div style={{
                ...styles.status,
                color: SEC_PLUS_COLORS[domain.id] || COMPTIA_ORANGE,
                borderColor: SEC_PLUS_COLORS[domain.id] || COMPTIA_ORANGE
              }}>
                {Math.round(domain.userScore * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: ACTION TERMINAL (35%) --- */}
      <div style={styles.rightColumn}>
        <ActionTerminal 
           preLoadedDrillId={preLoadedDrillId} 
           onDrillStarted={onDrillStarted}
           // Note: You can pass an accent color prop to ActionTerminal 
           // if you want the internal quiz buttons to be Orange too.
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
    background: 'rgba(0, 115, 174, 0.03)', // Very faint CompTIA Blue tint
    borderRadius: '4px'
  },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' },
  title: { color: COMPTIA_BLUE, margin: 0, fontSize: '1.2rem', fontWeight: 'bold' as const },
  burnoutMonitor: { color: '#666', fontSize: '0.8rem' },
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
  status: { fontSize: '0.7rem', border: '1px solid', padding: '4px 10px', background: 'rgba(255, 102, 0, 0.05)' },
};

export default SecPlusDashboard;