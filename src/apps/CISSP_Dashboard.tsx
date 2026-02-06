import React, { useMemo, useState, useEffect } from 'react';
import { client } from '../amplify-client'; 
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';
import ActionTerminal from '../components/terminal/ActionTerminal';
import { useDiagnosticEngine } from '../utils/useDiagnosticEngine';
import AIGatekeeper from '../components/ai/AIGatekeeper'; 

const DOMAIN_WEIGHTS: Record<string, number> = {
  RISK_MGMT: 0.15, 
  ASSET_SEC: 0.10, 
  SEC_ARCH_ENG: 0.13, 
  COMM_NET_SEC: 0.13,
  IAM: 0.13, 
  SEC_ASSESS_TEST: 0.12, 
  SEC_OPS: 0.13, 
  SOFTWARE_DEV_SEC: 0.11
};

interface DashboardProps {
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const CISSPDashboard: React.FC<DashboardProps> = ({ preLoadedDrillId, onDrillStarted }) => {
  const [activities, setActivities] = useState<Schema['UserActivity']['type'][]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);

  useEffect(() => {
    const sub = client.models.UserActivity.observeQuery().subscribe({
      next: ({ items }) => {
        setActivities([...items]);
      },
      error: (err) => console.error("SUBSCRIPTION_ERROR:", err)
    });
    return () => sub.unsubscribe();
  }, []);
  
  const { insights, getAriesChallenge, refresh } = useDiagnosticEngine();

  const stats = useMemo(() => {
    const domainScores: Record<string, number[]> = {};
    let totalDuration = 0;
    
    Object.keys(DOMAIN_WEIGHTS).forEach(d => {
      domainScores[d] = [];
    });

    activities.forEach(act => {
      const dbKey = (act.domain || '').toUpperCase().replace(/\s/g, '_');
      let targetKey = dbKey;
      
      if (dbKey.includes('RISK')) targetKey = 'RISK_MGMT';
      else if (dbKey.includes('ASSET')) targetKey = 'ASSET_SEC';
      else if (dbKey.includes('ARCH') || dbKey.includes('ENG')) targetKey = 'SEC_ARCH_ENG';
      else if (dbKey.includes('COMM') || dbKey.includes('NET')) targetKey = 'COMM_NET_SEC';
      else if (dbKey.includes('IAM') || dbKey.includes('IDENTITY')) targetKey = 'IAM';
      else if (dbKey.includes('ASSESS') || dbKey.includes('TEST')) targetKey = 'SEC_ASSESS_TEST';
      else if (dbKey.includes('OPS') || dbKey.includes('OPERATIONS')) targetKey = 'SEC_OPS';
      else if (dbKey.includes('SOFT') || dbKey.includes('DEV')) targetKey = 'SOFTWARE_DEV_SEC';

      if (domainScores[targetKey]) {
        domainScores[targetKey].push(act.score);
      }
      totalDuration += (act.duration || 0);
    });

    let weightedSum = 0;
    const domainIntegrity = Object.keys(DOMAIN_WEIGHTS).map(domainKey => {
      const scores = domainScores[domainKey] || [];
      const hasData = scores.length > 0;
      const avg = hasData ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      weightedSum += avg * (DOMAIN_WEIGHTS[domainKey]); 

      const anyFailures = scores.some(s => s < 100);
      let status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' = 'OPTIMAL';
      
      if (hasData) {
        if (anyFailures || avg < 85) status = 'CRITICAL';
        else if (avg < 100) status = 'DEGRADED';
      }

      return {
        id: domainKey,
        label: CISSP_DOMAIN_MAP[domainKey as keyof typeof CISSP_DOMAIN_MAP] || domainKey,
        score: Math.round(avg),
        status: status,
        hasData
      };
    });
    
    return { 
        readiness: Math.round(weightedSum), 
        domains: domainIntegrity,
        totalLogs: activities.length,
        fatigueMins: Math.round(totalDuration / 60) 
    };
  }, [activities]);

  useEffect(() => {
    if (activeChallenge) return;

    const criticalSector = stats.domains.find(d => d.status === 'CRITICAL');

    if (criticalSector && stats.totalLogs > 0) {
      const engineChallenge = getAriesChallenge();
      if (engineChallenge) {
        setActiveChallenge(engineChallenge);
      } else {
        setActiveChallenge({
          fallacyType: 'STABILITY_ALERT',
          strawMan: `Sector ${criticalSector.label} failure detected. Score: ${criticalSector.score}%. Provide impact summary.`,
          topic: criticalSector.label,
          reason: 'MANUAL_WATCHDOG_TRIGGER',
          options: [] 
        });
      }
    }
  }, [stats, activeChallenge, getAriesChallenge]);

  const handleAriesResolve = (summary: string) => {
    console.log("ARIES_RESOLVED:", summary);
    setActiveChallenge(null);
    refresh();
  };

  return (
    <div style={styles.dashboardWrapper}>
      {activeChallenge && (
        <AIGatekeeper 
          challenge={activeChallenge} 
          onResolve={handleAriesResolve} 
        />
      )}

      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // CISSP_SOC</h2>
          <div style={styles.burnoutMonitor}>
            <span style={styles.label}>OPERATOR_LOAD:</span>
            <span style={{...styles.value, color: stats.fatigueMins > 120 ? '#ff4b2b' : '#00ff41'}}>
              {stats.fatigueMins} MINS
            </span>
          </div>
        </header>

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
            <div style={styles.metricValue}>{stats.totalLogs}</div>
            <div style={styles.footer}>Active Telemetry Stream</div>
          </div>
        </div>

        <div style={styles.domainGrid}>
          {stats.domains.map((d, i) => (
            <div key={d.id} style={{
              ...styles.domainCard, 
              borderLeft: `4px solid ${d.status === 'CRITICAL' ? '#ff4b2b' : (DOMAIN_COLORS[d.id] || '#333')}`,
              background: d.status === 'CRITICAL' ? 'rgba(255, 75, 43, 0.05)' : 'rgba(5, 5, 5, 0.8)',
              borderColor: d.status === 'CRITICAL' ? '#ff4b2b' : '#222'
            }}>
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>SECTOR_0{i+1}</span>
                <span style={{ 
                  ...styles.domainName, 
                  color: d.status === 'CRITICAL' ? '#ff4b2b' : '#aaa' 
                }}>
                  {d.label.toUpperCase()}
                </span>
              </div>
              <div style={{
                ...styles.status, 
                borderColor: d.status === 'CRITICAL' ? '#ff4b2b' : (DOMAIN_COLORS[d.id] || '#333'), 
                color: d.status === 'CRITICAL' ? '#ff4b2b' : (DOMAIN_COLORS[d.id] || '#333')
              }}>
                {d.score}% {d.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.rightColumn}>
        <ActionTerminal 
           preLoadedDrillId={preLoadedDrillId} 
           onDrillStarted={() => {
             if (onDrillStarted) onDrillStarted();
             refresh();
           }}
        />
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', fontFamily: 'monospace', position: 'relative' as const },
  leftColumn: { flex: '0 0 65%', padding: '10px' },
  rightColumn: { 
    flex: '0 0 35%', 
    padding: '10px', 
    borderLeft: '1px solid #222', 
    background: 'rgba(5, 5, 5, 0.4)',
    borderRadius: '8px'
  },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' },
  title: { color: '#00ff41', margin: 0, fontSize: '1.2rem' },
  burnoutMonitor: { color: '#888', fontSize: '0.8rem' },
  label: { marginRight: '5px' },
  value: { color: '#00ff41', fontWeight: 'bold' as const },
  metricsRow: { display: 'grid' as const, gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  metricCard: { background: 'rgba(5, 5, 5, 0.5)', border: '1px solid #111', padding: '20px', borderRadius: '4px' },
  metricLabel: { fontSize: '0.7rem', color: '#666', marginBottom: '10px' },
  metricValue: { fontSize: '1.8rem', color: '#00ff41', fontWeight: 'bold' as const },
  progressBar: { width: '100%', height: '4px', background: '#111', marginTop: '10px' },
  progressFill: { height: '100%', background: '#00ff41' },
  footer: { fontSize: '0.6rem', color: '#444', marginTop: '10px' },
  domainGrid: { display: 'grid' as const, gridTemplateColumns: '1fr', gap: '10px' },
  domainCard: { border: '1px solid #222', padding: '15px', display: 'flex' as const, justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' },
  domainInfo: { display: 'flex' as const, flexDirection: 'column' as const, maxWidth: '70%' },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', letterSpacing: '1px' },
  status: { fontSize: '0.7rem', border: '1px solid', padding: '4px 10px', whiteSpace: 'nowrap' as const },
};

export default CISSPDashboard;