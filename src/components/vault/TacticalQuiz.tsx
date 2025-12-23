import React, { useState, useRef } from 'react';

interface Question {
  id: number;
  text: string;
  options: string[];
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

  // 🔥 THE MASTER GATE: Ensures onComplete is only called once per session
  const hasReported = useRef(false);

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent double-clicking options

    const correct = option === data.questions[currentQuestion].correctAnswer;
    setSelectedOption(option);
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < data.questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      finalizeQuiz();
    }
  };

  const finalizeQuiz = () => {
    const finalScore = Math.round((score / data.questions.length) * 100);
    setShowResult(true);

    // 🔥 PREVENT MULTIPLE EMISSIONS
    // We check if we've already reported and if we are in DIAGNOSTIC mode
    if (!hasReported.current && mode === 'DIAGNOSTIC') {
      hasReported.current = true;
      console.log(`[TERMINAL_REPORT] Finalizing Diagnostic: ${finalScore}%`);
      onComplete(finalScore);
    }
  };

  return (
    <div style={{ ...s.container, borderColor: accent }}>
      {!showResult ? (
        <>
          <div style={s.header}>
            <span style={{ color: accent }}>{data.title}</span>
            <span style={s.progress}>Q: {currentQuestion + 1}/{data.questions.length}</span>
          </div>

          <div style={s.questionText}>{data.questions[currentQuestion].text}</div>

          <div style={s.optionsGrid}>
            {data.questions[currentQuestion].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={{
                  ...s.optionBtn,
                  borderColor: selectedOption === opt ? (isCorrect ? '#00ff41' : '#ff4b2b') : '#222',
                  backgroundColor: selectedOption === opt ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {selectedOption && (
            <div style={s.feedback}>
              <div style={{ color: isCorrect ? '#00ff41' : '#ff4b2b', marginBottom: '10px' }}>
                {isCorrect ? '✓ Correct Answer' : '⚠️ Incorrect Answer'}
              </div>
              <div style={s.explanation}>{data.questions[currentQuestion].explanation}</div>
              <button onClick={handleNext} style={{ ...s.nextBtn, backgroundColor: accent }}>
                [ NEXT ]
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={s.resultScreen}>
          <div style={s.resultTitle}>DIAGNOSTIC_COMPLETE</div>
          <div style={{ ...s.score, color: accent }}>{Math.round((score / data.questions.length) * 100)}%</div>
          <div style={s.resultMsg}>
            {score / data.questions.length >= 0.8 
              ? "STANCE: OPTIMAL. Access maintained." 
              : "STANCE: DEGRADED. Remediation required."}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  container: { background: '#050505', border: '1px solid', padding: '20px', fontFamily: 'monospace', minHeight: '400px', display: 'flex', flexDirection: 'column' as const },
  header: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '30px', borderBottom: '1px solid #111', paddingBottom: '10px' },
  progress: { color: '#666' },
  questionText: { fontSize: '1.1rem', color: '#fff', marginBottom: '30px', lineHeight: '1.4' },
  optionsGrid: { display: 'grid', gap: '10px', marginBottom: '20px' },
  optionBtn: { padding: '15px', textAlign: 'left' as const, color: '#aaa', background: 'transparent', border: '1px solid', cursor: 'pointer', fontFamily: 'monospace', transition: '0.2s' },
  feedback: { marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #111' },
  explanation: { fontSize: '0.8rem', color: '#888', marginBottom: '20px', fontStyle: 'italic' },
  nextBtn: { width: '100%', padding: '12px', border: 'none', color: '#000', fontWeight: 'bold' as const, cursor: 'pointer', fontFamily: 'monospace' },
  resultScreen: { textAlign: 'center' as const, marginTop: '50px' },
  resultTitle: { color: '#444', fontSize: '0.8rem', letterSpacing: '2px' },
  score: { fontSize: '4rem', fontWeight: 'bold' as const, margin: '20px 0' },
  resultMsg: { color: '#888', fontSize: '0.9rem' }
};

export default TacticalQuiz;