import React, { useState, useEffect, useRef } from 'react';
import TacticalQuiz from '../vault/TacticalQuiz'; 
import { emitRemediationTask } from '../../utils/taskEmitter';
import { CISSP_DOMAIN_MAP } from '../../cissp/constant'; // Import for sub-domain mapping

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
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [selectedSubDomain, setSelectedSubDomain] = useState<string | null>(null); // New State
  
  const isReporting = useRef(false);

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
    if (isReporting.current) return;
    isReporting.current = true;

    try {
      if (activeMission && score < 80) {
        // Use the sub-domain for the Kanban title/domain if one was selected
        const finalTitle = selectedSubDomain ? `[ ${selectedSubDomain.toUpperCase()} ]` : activeMission.label;
        const finalDomain = selectedSubDomain || activeMission.domain;

        console.log("LOGGING_VULNERABILITY: Reporting to Mission Control...");
        await emitRemediationTask(
          finalTitle,
          score,
          finalDomain,
          activeMission.id
        );
      }
      
      setActiveMission(null);
      setSelectedSubDomain(null); // Reset selection
    } catch (error) {
      console.error("TELEMETRY_FAILURE:", error);
    } finally {
      setTimeout(() => {
        isReporting.current = false;
      }, 1500);
    }
  };

  const terminalQuizData = {
    title: selectedSubDomain || activeMission?.label || "TERMINAL_DIAGNOSTIC",
    questions: [
      {
        id: 1,
        text: `Initializing ${selectedSubDomain || activeMission?.label} diagnostic. Confirm readiness.`,
        options: ["READY", "STANDBY"],
        correctAnswer: "READY",
        explanation: "Diagnostic protocols initiated."
      }
    ]
  };

  return (
    <div style={styles.container}>
      {/* 1. LOBBY VIEW */}
      {!activeMission ? (
        <div style={styles.menu}>
          <div style={styles.glitchTitle}>[ TESTING PROTOCOLS ]</div>
          <div style={styles.grid}>
            {missions.map((m) => (
              <button key={m.id} onClick={() => setActiveMission(m)} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.idText}>ID_{m.id.toUpperCase()}</span>
                  <span style={styles.statusDot} />
                </div>
                <div style={styles.cardLabel}>{m.label}</div>
                <div style={styles.cardDesc}>{m.description}</div>
              </button>
            ))}
          </div>
        </div>
      ) : activeMission.id === 'dom-quiz' && !selectedSubDomain ? (
        /* 2. SUB-DOMAIN SELECTION VIEW (Only for dom-quiz) */
        <div style={styles.menu}>
          <div style={styles.glitchTitle}>SELECT_TARGET_SECTOR</div>
          <div style={styles.grid}>
            {Object.entries(CISSP_DOMAIN_MAP).map(([key, name]) => (
              <button 
                key={key} 
                onClick={() => setSelectedSubDomain(name)} 
                style={styles.domainBtn}
              >
                [ {name.toUpperCase()} ]
              </button>
            ))}
          </div>
          <button onClick={() => setActiveMission(null)} style={styles.abortBtn}>
            [ BACK_TO_MENU ]
          </button>
        </div>
      ) : (
        /* 3. ACTIVE QUIZ VIEW */
        <div style={styles.activeQuizContainer}>
          <div style={styles.quizHeader}>
            <button onClick={() => { setActiveMission(null); setSelectedSubDomain(null); }} style={styles.abortBtn}>
              [ ABORT_SEQUENCE ]
            </button>
            <div style={styles.targetLabel}>
              TARGET: {selectedSubDomain ? selectedSubDomain.toUpperCase() : activeMission.label}
            </div>
          </div>
          <TacticalQuiz 
            data={terminalQuizData} 
            accent="#00ff41" 
            mode="DIAGNOSTIC" 
            onComplete={handleComplete} 
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { height: '100%', padding: '10px', color: '#00ff41', fontFamily: 'monospace' },
  menu: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  glitchTitle: { fontSize: '0.7rem', color: '#444', letterSpacing: '2px', borderBottom: '1px solid #222', paddingBottom: '5px' },
  grid: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  card: { 
    background: 'rgba(0, 255, 65, 0.02)', 
    border: '1px solid #1a1a1a', 
    padding: '15px', 
    textAlign: 'left' as const, 
    cursor: 'pointer',
    transition: '0.2s'
  },
  domainBtn: {
    background: 'rgba(0, 255, 65, 0.05)',
    border: '1px solid #222',
    color: '#00ff41',
    padding: '12px',
    textAlign: 'left' as const,
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    transition: '0.2s'
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  idText: { fontSize: '0.6rem', color: '#444' },
  statusDot: { width: '6px', height: '6px', background: '#00ff41', borderRadius: '50%', boxShadow: '0 0 5px #00ff41' },
  cardLabel: { fontSize: '0.9rem', color: '#00ff41', fontWeight: 'bold' as const, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '5px', textShadow: '0 0 5px rgba(0, 255, 65, 0.5)' },
  cardDesc: { fontSize: '0.7rem', color: '#666' },
  activeQuizContainer: { background: '#000', border: '1px solid #222', padding: '15px' },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #111', paddingBottom: '10px' },
  abortBtn: { background: 'transparent', border: 'none', color: '#ff4b2b', cursor: 'pointer', fontSize: '0.7rem' },
  targetLabel: { fontSize: '0.7rem', color: '#444' }
};

export default ActionTerminal;