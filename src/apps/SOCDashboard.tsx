import React, { useMemo, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { CISSP_DOMAIN_MAP, DOMAIN_COLORS } from '../cissp/constant';

const client = generateClient<Schema>();

// CISSP Official Weights (2024/2025)
const DOMAIN_WEIGHTS: Record<string, number> = {
  RISK_MGMT: 0.15,
  ASSET_SEC: 0.10,
  SEC_ARCH_ENG: 0.13,
  COMM_NET_SEC: 0.13,
  IAM: 0.13,
  SEC_ASSESS: 0.12,
  SEC_OPS: 0.13,
  SOFT_DEV_SEC: 0.11
};

const SOCDashboard: React.FC = () => {
  const [activities, setActivities] = useState<Schema['UserActivity']['type'][]>([]);

  useEffect(() => {
    const sub = client.models.UserActivity.observeQuery().subscribe({
      next: ({ items }) => setActivities([...items]),
    });
    return () => sub.unsubscribe();
  }, []);

  // --- THE MATH ENGINE ---
  const stats = useMemo(() => {
    const domainScores: Record<string, number[]> = {};
    let totalDuration = 0;

    // Initialize domains
    Object.keys(DOMAIN_WEIGHTS).forEach(d => domainScores[d] = []);

    activities.forEach(act => {
      if (domainScores[act.domain]) {
        domainScores[act.domain].push(act.score);
      }
      // Calculate fatigue (total duration in last 24h)
      const isRecent = new Date(act.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (isRecent) totalDuration += act.duration;
    });

    let weightedReadiness = 0;
    const domainIntegrity = Object.keys(DOMAIN_WEIGHTS).map(domain => {
      const scores = domainScores[domain];
      // EMA logic: average of last scores
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      weightedReadiness += avg * (DOMAIN_WEIGHTS[domain] / 1.0); 
      
      // SAFE CHECK: Get the label or use a placeholder if the key is missing
      const fullLabel = CISSP_DOMAIN_MAP[domain] || "Unknown: Sector Missing";
      const shortLabel = fullLabel.split(':')[0];

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

  const getDefcon = (score: number) => {
    if (score > 80) return { level: 1, label: 'MISSION READY', color: '#fff' };
    if (score > 60) return { level: 2, label: 'HIGH ALERT', color: '#f00' };
    if (score > 40) return { level: 3, label: 'OPERATIONAL', color: '#ff0' };
    return { level: 4, label: 'INITIAL TRAINING', color: '#00ff41' };
  };

  const defcon = getDefcon(stats.readiness);

  return (
    <div style={{ background: '#050505', color: '#00ff41', padding: '2rem', borderRadius: '12px', border: '1px solid #111', fontFamily: 'monospace' }}>
      
      {/* ALPHA ZONE: STRATEGIC OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #333', padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>PROBABILITY OF EXAM SUCCESS</div>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: defcon.color }}>{stats.readiness}%</div>
          <div style={{ fontSize: '1rem', letterSpacing: '3px' }}>DEFCON {defcon.level}: {defcon.label}</div>
        </div>

        <div style={{ border: '1px solid #333', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>COGNITIVE LOAD</div>
          <div style={{ fontSize: '2rem', marginTop: '10px' }}>{stats.fatigueMins} <span style={{fontSize: '1rem'}}>MINS</span></div>
          <div style={{ color: stats.fatigueMins > 120 ? '#f00' : '#888', fontSize: '0.7rem', marginTop: '10px' }}>
            {stats.fatigueMins > 120 ? '!!! FATIGUE ALERT: DISCONTINUE OPS !!!' : 'STABLE'}
          </div>
        </div>

        <div style={{ border: '1px solid #333', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>TOTAL ENGAGEMENTS</div>
          <div style={{ fontSize: '2rem', marginTop: '10px' }}>{activities.length}</div>
          <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '10px' }}>LOG ENTRIES RECORDED</div>
        </div>
      </div>

      {/* BRAVO ZONE: DOMAIN INTEGRITY GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        {stats.domains.map(d => (
          <div key={d.id} style={{ background: '#111', padding: '15px', borderLeft: `4px solid ${DOMAIN_COLORS[d.id]}` }}>
            <div style={{ fontSize: '0.7rem', color: '#888' }}>{d.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{d.score}%</span>
              <span style={{ fontSize: '0.6rem', color: d.status === 'OPTIMAL' ? '#00ff41' : d.status === 'DEGRADED' ? '#ff0' : '#f00' }}>
                {d.status}
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', background: '#222', marginTop: '10px' }}>
              <div style={{ width: `${d.score}%`, height: '100%', background: DOMAIN_COLORS[d.id] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SOCDashboard;