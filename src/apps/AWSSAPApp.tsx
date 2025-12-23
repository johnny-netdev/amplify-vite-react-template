import React, { useState } from 'react';
import AWSSAPDashboard from './AWS_SAP_Dashboard';
import AWSSAPVaultPage from '../aws/TacticalVaultPage'; // ⭐️ Import the bridge page

interface VaultAppProps {
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
}

const AWSSAPApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div style={v.container}>
      {/* BACKGROUND LAYER */}
      <video autoPlay loop muted playsInline style={v.video}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>
      <div style={v.vignette} />
      
      <div style={v.content}>
        {/* HEADER SECTION */}
        <div style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // AWS Solutions Architect Professional</h1>
          <button onClick={() => setShowAdmin(!showAdmin)} style={v.adminBtn}>
            {showAdmin ? '[ CLOSE ]' : '[ ADMIN_ACCESS ]'}
          </button>
        </div>

        {/* DYNAMIC VIEW SWITCHER */}
        {viewMode === 'STRATEGIC' ? (
          <AWSSAPDashboard />
        ) : (
          /* ⭐️ This now calls your modular vault which is collapsed by default */
          <AWSSAPVaultPage />
        )}
      </div>
    </div>
  );
};

const v = {
  container: { position: 'relative' as const, minHeight: '100vh', color: 'white', backgroundColor: '#000' },
  video: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' as const, zIndex: -1, opacity: 0.4 },
  vignette: { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)', zIndex: -1, pointerEvents: 'none' as const },
  content: { padding: '2rem', paddingTop: '80px', maxWidth: '1600px', margin: '0 auto', position: 'relative' as const, zIndex: 1 },
  header: { position: 'relative' as const, textAlign: 'center' as const, marginBottom: '2rem' },
  title: { color: '#ff9900', letterSpacing: '4px', fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 153, 0, 0.3)' },
  adminBtn: { position: 'absolute' as const, right: 0, top: 0, background: 'transparent', color: '#ff9900', border: '1px solid #ff9900', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem', fontFamily: 'monospace' },
};

export default AWSSAPApp;