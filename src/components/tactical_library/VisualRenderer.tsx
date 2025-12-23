import React from 'react';
import TacticalQuiz from './TacticalQuiz';
import TacticalInfographic from './TacticalInfographic';
import InteractiveCanvas from './InteractiveCanvas';

interface VisualRendererProps {
  type: 'QUIZ' | 'DIAGRAM' | 'INTERACTIVE' | 'LEGACY'; 
  content: any; 
  accentColor: string;
}

const VisualRenderer: React.FC<VisualRendererProps> = ({ type, content, accentColor }) => {
  // ⭐️ Fixed: This helper is now actually used below
  const getLegacySource = () => {
    if (!content) return '';
    // If content is an object (from getUrl), get the string. If it's already a string, use it.
    return typeof content === 'object' ? content.url : content;
  };

  const legacyUrl = getLegacySource();

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${accentColor}`, padding: '10px', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.6rem', color: accentColor, fontFamily: 'monospace' }}>
          DATA_STREAM // {type} // STATUS: ACTIVE
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* Case 1: Quiz */}
        {type === 'QUIZ' && content && <TacticalQuiz data={content} accent={accentColor} />}
        
        {/* Case 2: Diagram */}
        {type === 'DIAGRAM' && content && <TacticalInfographic data={content} accent={accentColor} />}

        {/* Case 3: Interactive */}
        {type === 'INTERACTIVE' && content && <InteractiveCanvas data={content} accent={accentColor} />}
        
        {/* Case 4: Legacy (Fixed logic and usage) */}
        {type === 'LEGACY' && legacyUrl && (
          <iframe 
            key={legacyUrl} // Forces refresh when switching files
            src={legacyUrl} 
            style={{ width: '100%', height: '100%', border: 'none', background: 'white' }} 
            title="Legacy Vault Content"
          />
        )}

        {!content && (
          <div style={{ color: '#333', textAlign: 'center', marginTop: '20%' }}>
            NO_CONTENT_DECODED
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualRenderer;