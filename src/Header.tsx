import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleTodos: () => void; 
  showTodos: boolean;
  context: 'LOBBY' | 'VAULT'; 
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleTodos, showTodos, context, viewMode, setViewMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the Authenticator hook
  const { authStatus, signOut, toSignIn } = useAuthenticator((context) => [
    context.authStatus,
    context.signOut,
    context.toSignIn,
  ]);

  const currentVault = location.pathname.substring(1); 
  const isVault = location.pathname !== '/';

  const handleModeChange = (mode: 'STRATEGIC' | 'TACTICAL') => {
    setViewMode(mode);
    if (currentVault) {
      navigate(`/${currentVault}`);
    }
  };

  const handleLogoClick = () => {
    setViewMode('LOBBY');
    navigate('/');
  };

  // --- Helper Render Functions ---
  const renderAuthButton = () => {
    if (authStatus === 'authenticated') {
      return (
        <button onClick={signOut} style={styles.authButton}>
          [ DISCONNECT ]
        </button>
      );
    } 
    return (
      <button onClick={toSignIn} style={styles.navButton}>
        Sign In
      </button>
    );
  };

  const renderKanbanButton = () => {
    return (
      <button onClick={onToggleTodos} style={showTodos ? styles.activeNavButton : styles.navButton}>
        {showTodos ? 'CLOSE_KANBAN' : 'OPEN_KANBAN'}
      </button>
    );
  };

  return (
    <header style={styles.header}>
      {/* 1. BRANDING & HOME NAVIGATION */}
      <div style={styles.logo} onClick={handleLogoClick}>
        <span style={{ color: '#00ff41', marginRight: '8px' }}>⚛️</span>
        <span style={{ letterSpacing: '2px' }}>SIGNAL_ONE</span>
      </div>

      {/* 2. DYNAMIC NAVIGATION AREA */}
      <nav style={styles.nav}>
        {/* Only show these buttons if we aren't in the Lobby */}
        {isVault && (
          <div style={styles.vaultNavGroup}>
            <button 
              onClick={() => handleModeChange('STRATEGIC')} 
              style={viewMode === 'STRATEGIC' ? styles.activeNavButton : styles.navButton}
            >
              [ STRATEGIC_SOC ]
            </button>
            <button 
              onClick={() => handleModeChange('TACTICAL')} 
              style={viewMode === 'TACTICAL' ? styles.activeNavButton : styles.navButton}
            >
              [ TACTICAL_VAULT ]
            </button>
          </div>
        )}
        
        {renderKanbanButton()}
        {renderAuthButton()}
      </nav>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 25px',
    backgroundColor: 'rgba(5, 5, 5, 0.8)', 
    backdropFilter: 'blur(15px)',
    color: 'white',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  vaultNavGroup: {
    display: 'flex',
    gap: '10px',
    marginRight: '20px',
    borderRight: '1px solid #333',
    paddingRight: '20px'
  },
  navButton: {
    padding: '6px 15px',
    backgroundColor: 'transparent',
    color: '#00ff41',
    border: '1px solid #333',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    transition: '0.2s',
  },
  activeNavButton: {
    padding: '6px 15px',
    backgroundColor: '#00ff41',
    color: 'black',
    border: '1px solid #00ff41',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  authButton: {
    padding: '6px 15px',
    backgroundColor: 'transparent',
    color: '#ff4b2b',
    border: '1px solid #ff4b2b',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
  }
};

export default Header;