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
      next: ({ items }) => setActivities([...items]),
    });
    return () => sub.unsubscribe();
  }, []);
  
  const { insights, getAriesChallenge, refresh } = useDiagnosticEngine();

  useEffect(() => {
    if (insights.totalPoints > 0 && !activeChallenge) {
      const challenge = getAriesChallenge();
      if (challenge) {
        console.log("ARIES // INTERCEPT_TRIGGERED:", challenge.topic);
        setActiveChallenge(challenge);
      }
    }
  }, [insights, getAriesChallenge, activeChallenge]);

  /*
  // TEMPORARY TEST TRIGGER REPLACE WITH useEffect ABOVE FOR SANDBOXING
  useEffect(() => {
    if (!activeChallenge) {
      console.log("MANUAL_TEST: Forcing ARIES overlay...");
      setActiveChallenge({
        id: 'test-intercept',
        topic: 'SYSTEM_INTEGRITY',
        fallacyType: 'STABILITY_CHECK',
        strawMan: 'ARIES TEST: If you see this, the fixed overlay and z-index are correct.',
        options: [
          { id: '1', text: 'Confirm Connectivity', isCorrect: true },
          { id: '2', text: 'Debug Mode', isCorrect: false }
        ]
      });
    }
  }, []); // Runs once on mount
  */
  const handleAriesResolve = (summary: string) => {
    console.log("ARIES // REBUTTAL_LOGGED:", summary);
    setActiveChallenge(null);
  };

  const stats = useMemo(() => {
    const domainScores: Record<string, number[]> = {};
    let totalDuration = 0;
    Object.keys(DOMAIN_WEIGHTS).forEach(d => domainScores[d] = []);

    activities.forEach(act => {
      const sanitizedKey = act.domain.toUpperCase().replace(/\s/g, '_');
      let targetKey = sanitizedKey;
      if (sanitizedKey === 'SEC_ASSESS') targetKey = 'SEC_ASSESS_TEST';
      if (sanitizedKey === 'SOFT_DEV_SEC') targetKey = 'SOFTWARE_DEV_SEC';

      if (domainScores[targetKey]) {
        domainScores[targetKey].push(act.score);
      }
      
      const isRecent = new Date(act.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (isRecent) totalDuration += act.duration;
    });

    let weightedReadiness = 0;
    const domainIntegrity = Object.keys(DOMAIN_WEIGHTS).map(domainKey => {
      const scores = domainScores[domainKey];
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      weightedReadiness += avg * (DOMAIN_WEIGHTS[domainKey]); 

      const fullName = CISSP_DOMAIN_MAP[domainKey as keyof typeof CISSP_DOMAIN_MAP];
      const displayLabel = fullName || domainKey.replace(/_/g, ' ');

      return {
        id: domainKey,
        label: displayLabel,
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
      {/* ⭐️ ARIES PORTAL: Forced fixed overlay so it can't be missed or hidden */}
      {activeChallenge && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 9999,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <AIGatekeeper 
            challenge={activeChallenge} 
            onResolve={handleAriesResolve} 
          />
        </div>
      )}

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
            <div style={styles.metricValue}>{insights.totalPoints}</div>
            <div style={styles.footer}>Granular Interaction Signals</div>
          </div>
        </div>

        <div style={styles.domainGrid}>
          {stats.domains.map((d, i) => (
            <div key={d.id} style={{
              ...styles.domainCard, 
              borderLeft: `4px solid ${DOMAIN_COLORS[d.id] || '#333'}`
            }}>
              <div style={styles.domainInfo}>
                <span style={styles.domainNum}>SECTOR_0{i+1}</span>
                <span style={styles.domainName}>{d.label.toUpperCase()}</span>
              </div>
              <div style={{
                ...styles.status, 
                borderColor: DOMAIN_COLORS[d.id] || '#333', 
                color: DOMAIN_COLORS[d.id] || '#333'
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
  dashboardWrapper: { display: 'flex' as const, gap: '20px', width: '100%', fontFamily: 'monospace' },
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
  domainCard: { border: '1px solid #222', padding: '15px', display: 'flex' as const, justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 5, 5, 0.8)' },
  domainInfo: { display: 'flex' as const, flexDirection: 'column' as const, maxWidth: '70%' },
  domainNum: { fontSize: '0.6rem', color: '#444' },
  domainName: { fontSize: '0.85rem', color: '#aaa', letterSpacing: '1px' },
  status: { fontSize: '0.7rem', border: '1px solid', padding: '4px 10px', whiteSpace: 'nowrap' as const },
};

export default CISSPDashboard;