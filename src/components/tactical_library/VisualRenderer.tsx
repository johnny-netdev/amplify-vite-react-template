import React from 'react';
import TacticalQuiz from '../vault/TacticalQuiz';
import TacticalInfographic from './TacticalInfographic';
import InteractiveCanvas from './InteractiveCanvas';

interface VisualRendererProps {
  type: 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY'; 
  content: any; 
  accentColor: string;
}

const VisualRenderer: React.FC<VisualRendererProps> = ({ type, content, accentColor }) => {
  
  // ⭐️ Fixed: Simplified URL resolution
  // TacticalVault now passes the raw string URL for Legacy
  const legacyUrl = typeof content === 'string' ? content : content?.url || '';

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* STATUS HEADER */}
      <div style={{ borderBottom: `1px solid ${accentColor}44`, padding: '5px 0', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6rem', color: accentColor, fontFamily: 'monospace', letterSpacing: '1px' }}>
          SYSTEM_NODE // {type} // DECRYPTED
        </span>
        <span style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace' }}>
          CRC_CHECK: OK
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
        {/* Case 1: Quiz (With structural safety) */}
        {type === 'QUIZ' && content?.questions && (
          <TacticalQuiz 
            data={content} 
            accent={accentColor}
            onComplete={(score) => console.log(`[VAULT] Drill Terminal: ${score}%`)}
          />
        )}
        
        {/* Case 2: Diagram */}
        {type === 'DIAGRAM' && content && (
          <TacticalInfographic data={content} accent={accentColor} />
        )}

        {/* Case 3: Interactive */}
        {type === 'INTERACTIVE' && content && (
          <InteractiveCanvas data={content} accent={accentColor} />
        )}
        
        {/* Case 4: Legacy (Fixed logic) */}
        {type === 'LEGACY' && legacyUrl && (
          <div style={{ height: '100%', width: '100%', background: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
            <iframe 
              key={legacyUrl} 
              src={legacyUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title="Legacy Intel File"
              sandbox="allow-scripts allow-same-origin" // Security best practice
            />
          </div>
        )}

        {/* Fallback for Empty or Corrupt Content */}
        {(!content || (type === 'QUIZ' && !content.questions)) && (
          <div style={s.errorState}>
            <div style={{ color: accentColor }}>[!] INTEL_STREAM_INTERRUPTED</div>
            <div style={{ color: '#444', fontSize: '0.7rem', marginTop: '10px' }}>
              REASON: {type === 'QUIZ' && !content?.questions ? "MISSING_JSON_SCHEMA" : "NULL_POINTER_EXCEPTION"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  errorState: { 
    display: 'flex', 
    flexDirection: 'column' as const,
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '60%', 
    fontFamily: 'monospace', 
    fontSize: '0.9rem',
    letterSpacing: '2px'
  }
};

export default VisualRenderer;