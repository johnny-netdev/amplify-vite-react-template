import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string | number;
  text: string;
  options: (string | Option)[]; 
  correctAnswer: string;
  explanation: string;
}

interface TacticalQuizProps {
  data: {
    title: string;
    questions: Question[];
  };
  accent?: string;
  mode?: 'PRACTICE' | 'DIAGNOSTIC';
  onComplete: (score: number) => void;
}

const TacticalQuiz: React.FC<TacticalQuizProps> = ({ data, accent = "#00ff41", mode = 'PRACTICE', onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const hasReported = useRef(false);

  useEffect(() => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(null);
    hasReported.current = false;
  }, [data]);

  const handleAnswer = (optionId: string) => {
    if (selectedOption) return; 

    const currentQ = data.questions[currentQuestion];
    const correct = optionId === currentQ.correctAnswer;
    
    setSelectedOption(optionId);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // ⭐️ Logic Update: In DIAGNOSTIC mode, auto-advance if user shouldn't see feedback
    if (mode === 'DIAGNOSTIC') {
        setTimeout(() => handleNext(), 800);
    }
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < data.questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  useEffect(() => {
    if (showResult && !hasReported.current) {
      const finalPercentage = Math.round((score / data.questions.length) * 100);
      hasReported.current = true;
      onComplete(finalPercentage);
    }
  }, [showResult, score, data.questions.length, onComplete]);

  const currentQ = data.questions[currentQuestion];

  return (
    <div style={{ ...s.container, borderColor: accent }}>
      {!showResult ? (
        <>
          <div style={s.header}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: accent, textTransform: 'uppercase' }}>{data.title || 'UNNAMED_DRILL'}</span>
                <span style={{ fontSize: '0.5rem', color: '#444', marginTop: '4px' }}>OPERATIONAL_MODE: {mode}</span>
            </div>
            <span style={s.progress}>NODE: {currentQuestion + 1} / {data.questions.length}</span>
          </div>

          <div style={s.questionText}>{currentQ.text}</div>

          <div style={s.optionsGrid}>
            {currentQ.options.map((opt, idx) => {
              const optId = typeof opt === 'string' ? opt : opt.id;
              const optText = typeof opt === 'string' ? opt : opt.text;
              
              const isThisSelected = selectedOption === optId;
              
              // ⭐️ UI Fix: Only show red/green borders in PRACTICE mode
              const borderCol = isThisSelected && mode === 'PRACTICE' 
                ? (isCorrect ? '#00ff41' : '#ff4b2b') 
                : (isThisSelected ? accent : '#222');

              return (
                <button
                  key={optId || idx}
                  onClick={() => handleAnswer(optId)}
                  style={{
                    ...s.optionBtn,
                    borderColor: borderCol,
                    backgroundColor: isThisSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                    color: isThisSelected ? '#fff' : '#aaa'
                  }}
                >
                  <span style={{ color: accent, marginRight: '10px' }}>[{String.fromCharCode(65 + idx)}]</span>
                  {optText}
                </button>
              );
            })}
          </div>

          {/* ⭐️ Logic Update: Hide feedback/explanation if in DIAGNOSTIC mode */}
          {selectedOption && mode === 'PRACTICE' && (
            <div style={{...s.feedback, borderColor: isCorrect ? '#00ff4133' : '#ff4b2b33'}}>
              <div style={{ color: isCorrect ? '#00ff41' : '#ff4b2b', marginBottom: '10px', fontSize: '0.8rem' }}>
                {isCorrect ? '✓ ANALYTIC_MATCH_CONFIRMED' : '⚠️ DATA_MISMATCH_DETECTED'}
              </div>
              <div style={s.explanation}>{currentQ.explanation}</div>
              <button onClick={handleNext} style={{ ...s.nextBtn, backgroundColor: accent }}>
                CONTINUE_TO_NEXT_NODE
              </button>
            </div>
          )}
          
          {selectedOption && mode === 'DIAGNOSTIC' && (
             <div style={{ textAlign: 'center', color: '#444', fontSize: '0.6rem', marginTop: '20px' }}>
                RECORDING_RESPONSE...
             </div>
          )}
        </>
      ) : (
        <div style={s.resultScreen}>
          <div style={s.resultTitle}>DIAGNOSTIC_COMPLETE</div>
          <div style={{ ...s.score, color: accent }}>{Math.round((score / data.questions.length) * 100)}%</div>
          <div style={s.resultMsg}>
            {score / data.questions.length >= 0.8 
              ? "STANCE: OPTIMAL. Credentials Validated." 
              : "STANCE: DEGRADED. Re-entry suggested."}
          </div>
          <button 
            onClick={() => {
              setCurrentQuestion(0);
              setScore(0);
              setShowResult(false);
              hasReported.current = false;
            }}
            style={{...s.nextBtn, backgroundColor: 'transparent', color: accent, border: `1px solid ${accent}`, marginTop: '20px'}}
          >
            REBOOT_DRILL
          </button>
        </div>
      )}
    </div>
  );
};

const s = {
  container: { background: 'rgba(5,5,5,0.9)', border: '1px solid', padding: '30px', fontFamily: 'monospace', minHeight: '450px', display: 'flex', flexDirection: 'column' as const, borderRadius: '8px' },
  header: { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px', letterSpacing: '1px' },
  progress: { color: '#666' },
  questionText: { fontSize: '1rem', color: '#fff', marginBottom: '35px', lineHeight: '1.6', minHeight: '60px' },
  optionsGrid: { display: 'grid', gap: '12px', marginBottom: '20px' },
  optionBtn: { padding: '16px', textAlign: 'left' as const, background: 'transparent', border: '1px solid', cursor: 'pointer', fontFamily: 'monospace', transition: '0.2s', fontSize: '0.85rem' },
  feedback: { marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.01)', border: '1px solid', borderRadius: '4px' },
  explanation: { fontSize: '0.75rem', color: '#888', marginBottom: '20px', lineHeight: '1.5' },
  nextBtn: { width: '100%', padding: '14px', border: 'none', color: '#000', fontWeight: 'bold' as const, cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '1px' },
  resultScreen: { textAlign: 'center' as const, padding: '40px 0' },
  resultTitle: { color: '#666', fontSize: '0.7rem', letterSpacing: '3px' },
  score: { fontSize: '5rem', fontWeight: 'bold' as const, margin: '15px 0' },
  resultMsg: { color: '#aaa', fontSize: '0.8rem', letterSpacing: '1px' }
};

export default TacticalQuiz;