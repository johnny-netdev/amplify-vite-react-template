import React, { useMemo, useState, useEffect } from 'react';
import { client } from '../amplify-client'; 
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';
import ActionTerminal from '../components/terminal/ActionTerminal';
import { useDiagnosticEngine } from '../utils/useDiagnosticEngine';
import AIGatekeeper from '../components/ai/AIGatekeeper'; 

const DOMAIN_WEIGHTS: Record<string, number> = {
  RISK_MGMT: 0.15, ASSET_SEC: 0.10, SEC_ARCH_ENG: 0.13, COMM_NET_SEC: 0.13,
  IAM: 0.13, SEC_ASSESS_TEST: 0.12, SEC_OPS: 0.13, SOFTWARE_DEV_SEC: 0.11
};

const CISSPDashboard: React.FC<{ preLoadedDrillId?: string | null; onDrillStarted?: () => void }> = ({ preLoadedDrillId, onDrillStarted }) => {
  const [activities, setActivities] = useState<Schema['UserActivity']['type'][]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const { getAriesChallenge, refresh } = useDiagnosticEngine();

  useEffect(() => {
    const sub = client.models.UserActivity.observeQuery().subscribe({
      next: ({ items }) => setActivities([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  const { domains, totalLogs, readiness, fatigueMins } = useMemo(() => {
    const scores: Record<string, number[]> = {};
    Object.keys(DOMAIN_WEIGHTS).forEach(d => scores[d] = []);
    let duration = 0;

    activities.forEach(act => {
      const dbKey = (act.domain || '').toUpperCase().replace(/\s/g, '_');
      let target = dbKey;
      if (dbKey.includes('RISK')) target = 'RISK_MGMT';
      else if (dbKey.includes('ASSET')) target = 'ASSET_SEC';
      else if (dbKey.includes('ARCH') || dbKey.includes('ENG')) target = 'SEC_ARCH_ENG';
      else if (dbKey.includes('COMM') || dbKey.includes('NET')) target = 'COMM_NET_SEC';
      else if (dbKey.includes('IAM') || dbKey.includes('IDENTITY')) target = 'IAM';
      else if (dbKey.includes('ASSESS') || dbKey.includes('TEST')) target = 'SEC_ASSESS_TEST';
      else if (dbKey.includes('OPS') || dbKey.includes('OPERATIONS')) target = 'SEC_OPS';
      else if (dbKey.includes('SOFT') || dbKey.includes('DEV')) target = 'SOFTWARE_DEV_SEC';

      if (scores[target]) scores[target].push(act.score);
      duration += (act.duration || 0);
    });

    let weighted = 0;
    const items = Object.keys(DOMAIN_WEIGHTS).map(key => {
      const s = scores[key];
      const avg = s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0;
      weighted += avg * DOMAIN_WEIGHTS[key];
      return {
        id: key,
        label: CISSP_DOMAIN_MAP[key as keyof typeof CISSP_DOMAIN_MAP] || key,
        score: Math.round(avg),
        status: (s.length && (s.some(v => v < 100) || avg < 85)) ? 'CRITICAL' : 'OPTIMAL'
      };
    });

    return { domains: items, totalLogs: activities.length, readiness: Math.round(weighted), fatigueMins: Math.round(duration / 60) };
  }, [activities]);

  const criticalCount = domains.filter(d => d.status === 'CRITICAL').length;

  useEffect(() => {
    if (activeChallenge || totalLogs === 0 || criticalCount === 0) return;

    const criticalSector = domains.find(d => d.status === 'CRITICAL');
    if (!criticalSector) return;

    const engineChallenge = getAriesChallenge();
    setActiveChallenge(engineChallenge || {
      id: `manual-${Date.now()}`,
      fallacyType: 'STABILITY_ALERT',
      strawMan: `Sector ${criticalSector.label} failure detected (${criticalSector.score}%). Resolve now.`,
      topic: criticalSector.label,
      options: []
    });
  }, [criticalCount, totalLogs, getAriesChallenge, activeChallenge, domains]);

  return (
    <div style={styles.dashboardWrapper}>
      {activeChallenge && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(0,0,0,0.85)' }}>
          <AIGatekeeper 
            challenge={activeChallenge} 
            onResolve={() => { setActiveChallenge(null); refresh(); }} 
          />
        </div>
      )}

      <div style={styles.leftColumn}>
        <header style={styles.header}>
          <h2 style={styles.title}>STRATEGIC_INTEL // CISSP_SOC</h2>
          <div style={styles.burnoutMonitor}>LOAD: {fatigueMins} MINS</div>
        </header>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>EXAM_PROBABILITY</div>
            <div style={styles.metricValue}>{readiness}%</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>LOGS</div>
            <div style={styles.metricValue}>{totalLogs}</div>
          </div>
        </div>

        <div style={styles.domainGrid}>
          {domains.map((d) => (
            <div key={d.id} style={{
              ...styles.domainCard, 
              borderLeft: `4px solid ${d.status === 'CRITICAL' ? '#ff4b2b' : (DOMAIN_COLORS[d.id] || '#333')}`,
              borderColor: d.status === 'CRITICAL' ? '#ff4b2b' : '#222'
            }}>
              <span style={{ color: d.status === 'CRITICAL' ? '#ff4b2b' : '#aaa' }}>{d.label.toUpperCase()}</span>
              <span style={{ color: d.status === 'CRITICAL' ? '#ff4b2b' : '#555' }}>{d.score}% {d.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.rightColumn}>
        <ActionTerminal preLoadedDrillId={preLoadedDrillId} onDrillStarted={() => { onDrillStarted?.(); refresh(); }} />
      </div>
    </div>
  );
};

const styles = {
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', fontFamily: 'monospace', position: 'relative' as const, color: '#fff' },
  leftColumn: { flex: '0 0 65%', padding: '10px' },
  rightColumn: { flex: '0 0 35%', padding: '10px', borderLeft: '1px solid #222', background: 'rgba(5,5,5,0.4)' },
  header: { display: 'flex' as const, justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #333' },
  title: { color: '#00ff41', fontSize: '1.1rem' },
  burnoutMonitor: { color: '#666', fontSize: '0.8rem' },
  metricsRow: { display: 'grid' as const, gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  metricCard: { background: '#0a0a0a', border: '1px solid #111', padding: '15px' },
  metricLabel: { fontSize: '0.7rem', color: '#444' },
  metricValue: { fontSize: '1.5rem', color: '#00ff41' },
  domainGrid: { display: 'flex' as const, flexDirection: 'column' as const, gap: '8px' },
  domainCard: { background: '#050505', border: '1px solid #222', padding: '12px', display: 'flex' as const, justifyContent: 'space-between', fontSize: '0.8rem' }
};

export default CISSPDashboard;