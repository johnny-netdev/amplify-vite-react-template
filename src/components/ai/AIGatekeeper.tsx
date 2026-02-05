import React, { useState } from 'react';

interface ChallengeData {
  id: string;
  fallacyType: string;
  strawMan: string;
  options: {
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

  const handleSelection = (optId: string, isCorrect: boolean) => {
    setSelectedOption(optId);
    if (isCorrect) {
      setTimeout(() => setStep(2), 1000);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <span>ARIES // VIGILANCE_GATE</span>
          <span style={s.fallacyTag}>{challenge.fallacyType}</span>
        </div>

        {step === 1 ? (
          <div style={s.body}>
            <div style={s.strawManBox}>
              <span style={s.label}>"CONFIDENTLY_WRONG" STATEMENT:</span>
              <p>"{challenge.strawMan}"</p>
            </div>
            
            <div style={s.optionsGrid}>
              {challenge.options.map((opt) => (
                <button
                  key={opt.id}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelection(opt.id, opt.isCorrect)}
                  style={{
                    ...s.optionBtn,
                    borderColor: selectedOption === opt.id 
                      ? (opt.isCorrect ? '#00ff41' : '#ff4b2b') 
                      : '#222'
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={s.body}>
            <p style={s.instruction}>CORE_LOGIC_MATCHED. Now, summarize the impact of this fallacy in one sentence for the logs:</p>
            <textarea 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={s.textArea}
              placeholder="e.g., This creates a single point of failure..."
            />
            <button 
              onClick={() => onResolve(summary)} 
              style={s.submitBtn}
              disabled={summary.length < 5}
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
  overlay: { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { width: '600px', background: '#050505', border: '1px solid #333', padding: '40px', fontFamily: 'monospace', borderRadius: '4px' },
  header: { display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.7rem', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' },
  fallacyTag: { color: '#00ff41', border: '1px solid #00ff41', padding: '2px 8px' },
  body: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  strawManBox: { background: '#0a0a0a', padding: '20px', borderLeft: '3px solid #ff4b2b' },
  label: { color: '#444', fontSize: '0.6rem', marginBottom: '10px', display: 'block' },
  optionsGrid: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  optionBtn: { background: 'transparent', border: '1px solid', color: '#aaa', padding: '15px', textAlign: 'left' as const, cursor: 'pointer', fontSize: '0.8rem' },
  instruction: { color: '#00ff41', fontSize: '0.8rem', marginBottom: '10px' },
  textArea: { background: '#111', border: '1px solid #333', color: '#fff', padding: '15px', minHeight: '80px', fontFamily: 'monospace', marginBottom: '20px' },
  submitBtn: { background: '#00ff41', color: '#000', padding: '15px', fontWeight: 'bold' as const, border: 'none', cursor: 'pointer' }
};

export default AIGatekeeper;