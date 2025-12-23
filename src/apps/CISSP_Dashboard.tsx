import React, { useMemo, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';


const DOMAIN_WEIGHTS: Record<string, number> = {
  RISK_MGMT: 0.15, ASSET_SEC: 0.10, SEC_ARCH_ENG: 0.13, COMM_NET_SEC: 0.13,
  IAM: 0.13, SEC_ASSESS: 0.12, SEC_OPS: 0.13, SOFT_DEV_SEC: 0.11
};

const SOCDashboard: React.FC = () => {
  const [activities, setActivities] = useState<Schema['UserActivity']['type'][]>([]);

  useEffect(() => {
    const sub = client.models.UserActivity.observeQuery().subscribe({
      next: ({ items }) => setActivities([...items]),
    });
    return () => sub.unsubscribe();
  }, []);
  const client = generateClient<Schema>();


  // --- LIVE MATH ENGINE ---
  const stats = useMemo(() => {
    const domainScores: Record<string, number[]> = {};
    let totalDuration = 0;
    Object.keys(DOMAIN_WEIGHTS).forEach(d => domainScores[d] = []);

    activities.forEach(act => {
      if (domainScores[act.domain]) domainScores[act.domain].push(act.score);
      const isRecent = new Date(act.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (isRecent) totalDuration += act.duration;
    });

    let weightedReadiness = 0;
    const domainIntegrity = Object.keys(DOMAIN_WEIGHTS).map(domain => {
      const scores = domainScores[domain];
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      weightedReadiness += avg * (DOMAIN_WEIGHTS[domain]); 
      const shortLabel = (CISSP_DOMAIN_MAP[domain] || "Unknown").split(':')[0];

      return {
        id: domain,
        label: shortLabel,
        score: Math.round(avg),
        status: avg >= 80 ? 'OPTIMAL' : avg >= 60 ? 'DEGRADED' : 'CRITICAL'
      };
    });
    
    return { 
        readiness: Math.round(weightedReadiness), 
        domains: domainIntegrity,
        fatigueMins: Math.round(totalDuration / 60) 
    };
  }, [activities]);

  return (
    <div style={styles.dashboardWrapper}>
      {/* --- LEFT SIDE: STRATEGIC INTEL (70%) --- */}
      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // CISSP_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_LOAD:</span>
            <span style={{...styles.value, color: stats.fatigueMins > 120 ? '#ff4b2b' : '#00ff41'}}>
              {stats.fatigueMins} MINS {stats.fatigueMins > 120 ? '[OVERLOAD]' : '[STABLE]'}
            </span>
          </div>
        </header>

        {/* Metric Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>EXAM_PROBABILITY</div>
            <div style={styles.metricValue}>{stats.readiness}%</div>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${stats.readiness}%`}} />
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>ENGAGEMENT_LOGS</div>
            <div style={styles.metricValue}>{activities.length}</div>
            <div style={styles.footer}>Total Data Points Recorded</div>
          </div>
        </div>

        {/* Domain Grid */}
        <div style={styles.domainGrid}>
          {stats.domains.map((d, i) => (
            <div key={d.id} style={styles.domainCard}>
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>SECTOR_0{i+1}</span>
                <span style={styles.domainName}>{d.label.toUpperCase()}</span>
              </div>
              <div style={{...styles.status, borderColor: DOMAIN_COLORS[d.id], color: DOMAIN_COLORS[d.id]}}>
                {d.score}% {d.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: ACTION TERMINAL (30%) --- */}
      <div style={styles.rightColumn}>
        <div style={styles.terminalHeader}>ACTION_TERMINAL</div>
        <div style={styles.terminalBody}>
          <button style={styles.testButton}>[ RUN_CAT_EXAM_SIM ]</button>
          <button style={styles.testButton}>[ DOMAIN_DRILL_OVERRIDE ]</button>
          <button style={styles.testButton}>[ WEAK_POINT_SCAN ]</button>
          <button style={styles.testButton}>[ BCP_DRP_SCENARIOS ]</button>
          
          <div style={styles.terminalFooter}>
            SYSTEM_STATUS: ACTIVE<br />
            AWAITING_CRITICAL_INPUT...
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable SOC styles
const styles = {
  dashboardWrapper: { display: 'flex', gap: '20px', width: '100%', fontFamily: 'monospace' },
  leftColumn: { flex: '0 0 70%', padding: '10px' },
  rightColumn: { flex: '0 0 30%', padding: '10px', borderLeft: '1px solid #333', background: 'rgba(0, 255, 65, 0.02)' },
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
  status: { fontSize: '0.7rem', border: '1px solid', padding: '4px 10px' },
  terminalHeader: { color: '#666', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: '20px' },
  terminalBody: { display: 'flex', flexDirection: 'column' as const, gap: '15px' },
  testButton: { background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', padding: '15px', textAlign: 'left' as const, cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace' },
  terminalFooter: { marginTop: '30px', color: '#222', fontSize: '0.7rem' }
};

export default SOCDashboard;
