import React, { useState } from 'react';

interface ChallengeData {
  id?: string;
  fallacyType?: string;
  strawMan?: string;
  topic?: string; // Fallback support
  reason?: string; // Fallback support
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

interface GatekeeperProps {
  challenge: ChallengeData;
  onResolve: (userSummary: string) => void;
}

const AIGatekeeper: React.FC<GatekeeperProps> = ({ challenge, onResolve }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [step, setStep] = useState(1); // 1: Analysis, 2: Summarization

  // ⭐️ SAFETY: Handle fallback challenges that don't have the full quiz structure
  const isFallback = !challenge.options || challenge.options.length === 0;

  const handleSelection = (optId: string, isCorrect: boolean) => {
    setSelectedOption(optId);
    if (isCorrect) {
      setTimeout(() => setStep(2), 800);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <span>ARIES // SYSTEM_INTERCEPT_ACTIVE</span>
          <span style={s.fallacyTag}>{challenge.fallacyType || "VULNERABILITY_DETECTED"}</span>
        </div>

        {step === 1 ? (
          <div style={s.body}>
            <div style={s.strawManBox}>
              <span style={s.label}>CRITICAL_SITUATION_REPORT:</span>
              <p style={{ color: '#fff', lineHeight: '1.5' }}>
                {challenge.strawMan || `Sector [${challenge.topic}] has dropped below stability thresholds. Diagnostic required to prevent cascading failure.`}
              </p>
              {challenge.reason && <p style={{ fontSize: '0.65rem', color: '#ff4b2b', marginTop: '10px' }}>CODE: {challenge.reason}</p>}
            </div>
            
            <div style={s.optionsGrid}>
              {isFallback ? (
                /* ⭐️ FALLBACK UI: Just a single "Acknowledge" path to move fast */
                <button
                  onClick={() => setStep(2)}
                  style={{ ...s.optionBtn, borderColor: '#00ff41', color: '#00ff41', textAlign: 'center' }}
                >
                  [ INITIATE_DIAGNOSTIC_RECOVERY ]
                </button>
              ) : (
                /* STANDARD UI: The full fallacy quiz */
                challenge.options?.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={selectedOption !== null}
                    onClick={() => handleSelection(opt.id, opt.isCorrect)}
                    style={{
                      ...s.optionBtn,
                      borderColor: selectedOption === opt.id 
                        ? (opt.isCorrect ? '#00ff41' : '#ff4b2b') 
                        : '#222',
                      color: selectedOption === opt.id && !opt.isCorrect ? '#ff4b2b' : '#aaa'
                    }}
                  >
                    {opt.text}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div style={s.body}>
            <p style={s.instruction}>DIAGNOSTIC_LOCK_MATCHED. Summarize your remediation strategy for the logs:</p>
            <textarea 
              autoFocus
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={s.textArea}
              placeholder="e.g. Need to review the CIA triad impact on this sector..."
            />
            <button 
              onClick={() => onResolve(summary)} 
              style={s.submitBtn}
              disabled={summary.length < 3} // Reduced length for faster testing
            >
              COMMIT_TO_MEMORY_AND_PROCEED
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  // Bumping zIndex to 9999 so it covers everything
  overlay: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modal: { width: '600px', background: '#050505', border: '1px solid #333', padding: '40px', fontFamily: 'monospace', borderRadius: '4px', boxShadow: '0 0 50px rgba(255, 75, 43, 0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.7rem', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' },
  fallacyTag: { color: '#00ff41', border: '1px solid #00ff41', padding: '2px 8px' },
  body: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  strawManBox: { background: '#0a0a0a', padding: '20px', borderLeft: '3px solid #ff4b2b' },
  label: { color: '#444', fontSize: '0.6rem', marginBottom: '10px', display: 'block' },
  optionsGrid: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  optionBtn: { background: 'transparent', border: '1px solid', color: '#aaa', padding: '15px', textAlign: 'left' as const, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s ease' },
  instruction: { color: '#00ff41', fontSize: '0.8rem', marginBottom: '10px' },
  textArea: { background: '#111', border: '1px solid #333', color: '#fff', padding: '15px', minHeight: '80px', fontFamily: 'monospace', marginBottom: '20px', outline: 'none' },
  submitBtn: { background: '#00ff41', color: '#000', padding: '15px', fontWeight: 'bold' as const, border: 'none', cursor: 'pointer' }
};

export default AIGatekeeper;