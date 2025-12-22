import React from 'react';
import SOCDashboard from './CISSP_Dashboard';

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
  return (
    <div style={vaultStyles.container}>
      <video autoPlay loop muted playsInline style={vaultStyles.bgVideo}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>

      <div style={vaultStyles.content}>
        <h1 style={vaultStyles.title}>VAULT_ACCESS // AWS SAP-C02</h1>

        {viewMode === 'STRATEGIC' ? (
          <SOCDashboard />
        ) : (
          <div style={{ display: 'flex', gap: '2rem', height: '80vh' }}>
            <aside style={vaultStyles.sidebar}>
              <h3 style={vaultStyles.sidebarHeader}>ARCHITECTURAL_PILLARS</h3>
              {Object.entries(AWS_SAP_DOMAINS).map(([key, label]) => (
                <div key={key} style={vaultStyles.domainItem}>[ {label} ]</div>
              ))}
            </aside>
            <main style={vaultStyles.mainArea}>
              <div style={vaultStyles.idleText}>AWAITING_CLOUD_SCHEMA_LOAD...</div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};
const vaultStyles = {
  container: { position: 'relative' as const, minHeight: '100vh', width: '100vw', overflow: 'hidden', color: 'white' },
  bgVideo: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -1, opacity: 0.4 },
  content: { padding: '2rem', paddingTop: '100px', maxWidth: '1600px', margin: '0 auto' },
  title: { color: '#00ff41', fontSize: '1.5rem', textAlign: 'center' as const, marginBottom: '2rem', letterSpacing: '4px' },
  sidebar: { width: '350px', background: 'rgba(10, 10, 10, 0.8)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' },
  sidebarHeader: { fontSize: '0.7rem', color: '#666', letterSpacing: '2px', marginBottom: '1rem' },
  domainItem: { padding: '10px', fontSize: '0.8rem', color: '#00ff41', cursor: 'pointer', borderBottom: '1px solid #222' },
  mainArea: { flex: 1, background: 'rgba(0, 0, 0, 0.6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  idleText: { color: '#333', letterSpacing: '3px', fontWeight: 'bold' }
};

export default AWSSAPApp;
