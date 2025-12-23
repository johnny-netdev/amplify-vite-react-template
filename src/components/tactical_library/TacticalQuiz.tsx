import React, { useState } from 'react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizProps {
  data: {
    title: string;
    questions: Question[];
  };
  accent: string;
}

const TacticalQuiz: React.FC<QuizProps> = ({ data, accent }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = data.questions[currentStep];

  const handleVerify = () => {
    if (selected === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);
    setCurrentStep(currentStep + 1);
  };

  if (currentStep >= data.questions.length) {
    return (
      <div style={q.resultCard}>
        <h2 style={{ color: accent }}>ASSESSMENT_COMPLETE</h2>
        <p style={{ fontSize: '2rem' }}>{Math.round((score / data.questions.length) * 100)}%</p>
        <button onClick={() => setCurrentStep(0)} style={{...q.btn, borderColor: accent, color: accent}}>RETRY_PROTOCOL</button>
      </div>
    );
  }

  return (
    <div style={q.container}>
      <div style={q.progress}>
        STEP_{currentStep + 1}_OF_{data.questions.length}
        <div style={{...q.progressBar, width: `${((currentStep + 1) / data.questions.length) * 100}%`, background: accent}} />
      </div>

      <h3 style={q.questionText}>{currentQuestion.text}</h3>

      <div style={q.optionsGrid}>
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => !showFeedback && setSelected(option)}
            style={{
              ...q.optionBtn,
              borderColor: selected === option ? accent : '#333',
              background: selected === option ? `${accent}15` : 'transparent',
              color: selected === option ? accent : '#aaa'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {!showFeedback ? (
        <button 
          disabled={!selected} 
          onClick={handleVerify} 
          style={{...q.verifyBtn, opacity: selected ? 1 : 0.3, background: accent}}
        >
          VERIFY_SELECTION
        </button>
      ) : (
        <div style={{...q.feedback, borderLeftColor: selected === currentQuestion.correctAnswer ? '#00ff41' : '#ff4b2b'}}>
          <p style={{fontWeight: 'bold', color: selected === currentQuestion.correctAnswer ? '#00ff41' : '#ff4b2b'}}>
            {selected === currentQuestion.correctAnswer ? 'VALIDATED // CORRECT' : 'TERMINATED // INCORRECT'}
          </p>
          <p style={{fontSize: '0.8rem', color: '#999'}}>{currentQuestion.explanation}</p>
          <button onClick={handleNext} style={{...q.btn, marginTop: '10px', borderColor: accent, color: accent}}>CONTINUE_SEQUENCE</button>
        </div>
      )}
    </div>
  );
};

const q = {
  container: { padding: '10px', fontFamily: 'monospace' },
  progress: { fontSize: '0.7rem', color: '#666', marginBottom: '20px' },
  progressBar: { height: '2px', marginTop: '5px', transition: '0.3s' },
  questionText: { fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.4' },
  optionsGrid: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '2rem' },
  optionBtn: { textAlign: 'left' as const, padding: '15px', border: '1px solid var(--accent-primary)', background: 'var(--glass-bg)', fontFamily: 'var(--font-mono)', borderRadius: '4px', cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem' },
  verifyBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: '4px', color: 'black', fontWeight: 'bold' as const, cursor: 'pointer', letterSpacing: '2px' },
  feedback: { padding: '15px', background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid' },
  btn: { background: 'transparent', border: '1px solid', padding: '8px 15px', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '1px' },
  resultCard: { textAlign: 'center' as const, padding: '40px', border: '1px dashed #333' }
};

export default TacticalQuiz;