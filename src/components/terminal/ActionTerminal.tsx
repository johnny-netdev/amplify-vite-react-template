import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import TacticalQuiz from '../vault/TacticalQuiz'; 
import { emitRemediationTask } from '../../utils/taskEmitter';
import { client } from '../../amplify-client';
import { getCertConfigByPath } from '../../utils/certRegistry';

interface TerminalProps {
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

interface Mission {
  id: string;
  label: string;
  description: string;
  domain: string;
}

const ActionTerminal: React.FC<TerminalProps> = ({ preLoadedDrillId, onDrillStarted }) => {
  const location = useLocation();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string | null>(null);
  const isReporting = useRef(false);

  // 🟢 DYNAMIC CONFIGURATION FROM REGISTRY
  const config = getCertConfigByPath(location.pathname);

  const missions: Mission[] = [
    { id: 'sim-exam', label: '[ EXAM SIMULATION ]', description: 'Adaptive simulation protocols.', domain: 'Full Spectrum' },
    { id: 'dom-quiz', label: '[ DOMAIN QUIZZES ]', description: 'Targeted sector evaluation.', domain: 'Targeted' },
    { id: 'weak-scan', label: '[ WEAK POINTS ANALYSIS ]', description: 'AI-driven vulnerability assessment.', domain: 'Adaptive' },
    { id: 'scen-drill', label: '[ SCENARIO ANALYSIS DRILLS ]', description: 'Critical infrastructure logic tests.', domain: 'Applied Logic' },
  ];

  useEffect(() => {
    if (preLoadedDrillId) {
      const target = missions.find(m => m.id === preLoadedDrillId);
      if (target) {
        setActiveMission(target);
        if (onDrillStarted) onDrillStarted();
      }
    }
  }, [preLoadedDrillId, onDrillStarted]);

  const handleComplete = async (score: number) => {
      const drillId = activeMission?.id || 'unknown-drill';
      if (isReporting.current) return; 
      isReporting.current = true;

      try {
        if (score >= 90) {
          const { data: existingTasks } = await client.models.Task.list({
            filter: { drillId: { eq: drillId }, status: { ne: 'COMPLETED' } }
          });
          await Promise.all(existingTasks.map(task => 
            client.models.Task.update({ id: task.id, status: 'COMPLETED' })
          ));
        } else {
          // Uses config.id (e.g., "AWS_SAP") for the emitter
          emitRemediationTask(
            drillId, 
            score, 
            selectedSubDomain || activeMission?.domain || "General", 
            "PROT_v1", // 🟢 Placeholder for the 4th argument (check taskEmitter.ts for what this actually is!)
            config.id  
          );
        }
        setActiveMission(null);
        setSelectedSubDomain(null); 
      } catch (error) {
        console.error("TELEMETRY_FAILURE:", error);
      } finally {
        setTimeout(() => { isReporting.current = false; }, 1500);
      }
  };

  return (
    <div style={{ ...styles.container, color: config.color }}>
      {!activeMission ? (
        <div style={styles.menu}>
          <div style={styles.glitchTitle}>[ {config.id}_TESTING_PROTOCOLS ]</div>
          <div style={styles.grid}>
            {missions.map((m) => (
              <button 
                key={m.id} 
                onClick={() => setActiveMission(m)} 
                style={{ ...styles.card, borderColor: config.color + '33' }}
              >
                <div style={styles.cardTop}>
                  <span style={styles.idText}>ID_{m.id.toUpperCase()}</span>
                  <span style={{ ...styles.statusDot, background: config.color, boxShadow: `0 0 5px ${config.color}` }} />
                </div>
                <div style={{ ...styles.cardLabel, color: config.color }}>{m.label}</div>
                <div style={styles.cardDesc}>{m.description}</div>
              </button>
            ))}
          </div>
        </div>
      ) : activeMission.id === 'dom-quiz' && !selectedSubDomain ? (
        <div style={styles.menu}>
          <div style={styles.glitchTitle}>SELECT_TARGET_SECTOR // {config.name}</div>
          <div style={styles.grid}>
            {Object.entries(config.map).map(([key, name]) => (
              <button 
                key={key} 
                onClick={() => setSelectedSubDomain(name)} 
                style={{ ...styles.domainBtn, color: config.color, borderColor: config.color + '44' }}
              >
                [ {name.toUpperCase()} ]
              </button>
            ))}
          </div>
          <button onClick={() => setActiveMission(null)} style={styles.abortBtn}>[ BACK_TO_MENU ]</button>
        </div>
      ) : (
        <div style={{ ...styles.activeQuizContainer, borderColor: config.color + '44' }}>
          <div style={styles.quizHeader}>
            <button onClick={() => { setActiveMission(null); setSelectedSubDomain(null); }} style={styles.abortBtn}>[ ABORT ]</button>
            <div style={styles.targetLabel}>VAULT: {config.name} // {selectedSubDomain || activeMission.label}</div>
          </div>
          <TacticalQuiz 
            data={{ 
                title: selectedSubDomain || activeMission.label, 
                questions: [{ id: 1, text: `Initiate ${config.name} Diagnostic?`, options: ["YES", "NO"], correctAnswer: "YES", explanation: "Protocol start." }]
            }} 
            accent={config.color} 
            mode="DIAGNOSTIC" 
            onComplete={handleComplete} 
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { height: '100%', padding: '10px', fontFamily: 'monospace' },
  menu: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  glitchTitle: { fontSize: '0.7rem', color: '#444', letterSpacing: '2px', borderBottom: '1px solid #222', paddingBottom: '5px' },
  grid: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  card: { background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #1a1a1a', padding: '15px', textAlign: 'left' as const, cursor: 'pointer' },
  domainBtn: { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #222', padding: '12px', textAlign: 'left' as const, cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.8rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  idText: { fontSize: '0.6rem', color: '#444' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%' },
  cardLabel: { fontSize: '0.9rem', fontWeight: 'bold' as const, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px' },
  cardDesc: { fontSize: '0.7rem', color: '#666' },
  activeQuizContainer: { background: '#000', border: '1px solid #222', padding: '15px' },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  abortBtn: { background: 'transparent', border: 'none', color: '#ff4b2b', cursor: 'pointer', fontSize: '0.7rem' },
  targetLabel: { fontSize: '0.7rem', color: '#444' }
};

export default ActionTerminal;