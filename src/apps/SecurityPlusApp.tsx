import React from 'react';
import '@aws-amplify/ui-react/styles.css'; 

// Import Constants and Sub-Pages
import SecurityPlusDashboard from './SecurityPlus_Dashboard';
import SecurityPlusVaultPage from '../securityplus/TacticalVaultPage';

interface VaultAppProps {
  isAdmin: boolean; 
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
  preLoadedDrillId?: string | null;
  onDrillStarted?: () => void;
}

const SecurityPlusApp: React.FC<VaultAppProps> = ({ viewMode }) => {
  return (
    <div className='theme-secplus' style={v.container}>
      {/* Background Elements */}
      <video key="secplus-bg-video" autoPlay loop muted playsInline style={v.video}>
        <source src="/backgrounds/3d_moving_hex_background.mp4" type="video/mp4" />
      </video>
      <div style={v.vignette} />
      
      <div style={v.content}>
        <header style={v.header}>
          <h1 style={v.title}>VAULT_ACCESS // CompTIA Security+</h1>
        </header>

        {/* The Admin Panel logic has been relocated to src/admins/AdminPortal.tsx.
           This app now focuses strictly on data visualization and drills.
        */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {viewMode === 'STRATEGIC' ? (
            <SecurityPlusDashboard /> 
          ) : (
            <SecurityPlusVaultPage />
          )}
        </div>
      </div>
    </div>
  );
};

const v = {
  container: { 
    position: 'relative' as const, 
    minHeight: '100vh', 
    color: 'white', 
    backgroundColor: 'transparent', 
    overflowX: 'hidden' as const 
  },
  video: { 
    position: 'fixed' as const, 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' as const, 
    zIndex: -2, 
    opacity: 0.5, 
    backgroundColor: '#000' 
  },
  vignette: { 
    position: 'fixed' as const, 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 100%)', 
    zIndex: -1, 
    pointerEvents: 'none' as const 
  },
  content: { 
    padding: '1rem', 
    maxWidth: '1600px', 
    margin: '0 auto', 
    position: 'relative' as const, 
    zIndex: 1 
  },
  header: { 
    position: 'relative' as const, 
    textAlign: 'center' as const, 
    marginBottom: '1rem' 
  },
  title: { 
    color: '#00ff41', 
    letterSpacing: '4px', 
    fontSize: '1.5rem', 
    textShadow: '0 0 10px rgba(0, 255, 65, 0.3)', 
    opacity: 0.8 
  }
};

export default SecurityPlusApp;