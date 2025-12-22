import React, { useState } from 'react';
import AWSSAPDashboard from './AWS_SAP_Dashboard';

interface VaultAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
}

const AWS_SAP_DOMAINS = {
  ORG_COMPLEXITY: "Design for Organizational Complexity",
  NEW_SOLUTIONS: "Design for New Solutions",
  CONT_IMPROVEMENT: "Continuous Improvement for Existing Solutions",
  MIGRATION: "Accelerate Migration & Modernization"
};

const AWSSAPApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);
  return (
     <div style={v.container}>
      <video autoPlay loop muted playsInline style={v.video}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>
      
      <div style={v.content}>
        <div style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // AWS Solutions Architect Professional</h1>
          <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>
            {showAdmin ? '[ CLOSE ]' : '[ ADMIN_ACCESS ]'}
          </button>
        </div>

        {viewMode === 'STRATEGIC' ? (
          <AWSSAPDashboard />
        ) : (
          <div style={{ display: 'flex', gap: '2rem', height: '80vh' }}>
            <aside style={v.sidebar}>
              <h3 style={v.header}>ARCHITECTURAL_PILLARS</h3>
              {Object.entries(AWS_SAP_DOMAINS).map(([key, label]) => (
                <div key={key} style={v.item}>[ {label} ]</div>
              ))}
            </aside>
            <main style={v.main}>
              <div style={v.main}>AWAITING_CLOUD_SCHEMA_LOAD...</div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

const v = {
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white' },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -1, opacity: 0.4 },
  content: { padding: '2rem', paddingTop: '80px', maxWidth: '1400px', margin: '0 auto' },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '2rem' },
  title: { color: '#00ff41', letterSpacing: '4px', fontSize: '1.5rem' },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#00ff41', border: '1px solid #00ff41', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem' },
  uploadPanel: { background: 'rgba(0,20,0,0.9)', padding: '20px', border: '1px solid #00ff41', marginBottom: '20px', borderRadius: '8px' },
  tactical: { display: 'flex', gap: '20px', height: '75vh' },
  sidebar: { width: '350px', background: 'rgba(10,10,10,0.8)', padding: '20px', border: '1px solid #333', borderRadius: '12px', overflowY: 'auto' as const },
  item: { padding: '12px 10px', color: '#00ff41', fontSize: '0.75rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', fontFamily: 'monospace' },
  main: { flex: 1, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', borderRadius: '12px', border: '1px solid #222', letterSpacing: '2px' }
};

export default AWSSAPApp;
