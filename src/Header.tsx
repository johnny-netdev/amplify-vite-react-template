import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onToggleTodos: () => void; 
  showTodos: boolean;
  context: 'LOBBY' | 'VAULT'; 
  viewMode: 'LOBBY' | 'STRATEGIC' | 'TACTICAL';
  setViewMode: (val: 'LOBBY' | 'STRATEGIC' | 'TACTICAL') => void;
  notifications: { id: string, msg: string, time: string }[];
  clearNotifications: () => void;
  isAdmin: boolean; // 🟢 Strictly controlled by App.tsx
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleTodos, 
  showTodos, 
  viewMode, 
  setViewMode, 
  notifications, 
  clearNotifications,
  context,
  isAdmin // 🟢 Destructured from props
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI States
  const [showLog, setShowLog] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const { authStatus, signOut, toSignIn } = useAuthenticator(({ authStatus }) => [
    authStatus
  ]);

  const currentVault = location.pathname.substring(1); 
  const isVault = location.pathname !== '/';

  // Trigger red badge when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      setHasUnread(true);
    }
  }, [notifications.length]);

  // Clear badge when the user opens the log
  useEffect(() => {
    if (showLog) {
      setHasUnread(false);
    }
  }, [showLog]);

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

  const handleSignOut = () => {
    signOut();
    navigate('/'); 
  };

  const renderAuthButton = () => {
    if (authStatus === 'authenticated') {
      return (
        <button onClick={handleSignOut} style={styles.authButton}>
          [ SIGN OUT ]
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
        {showTodos ? '[ CLOSE TASKS ]' : '[ OPEN TASKS ]'}
      </button>
    );
  };

  const renderNotificationLog = () => {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={() => setShowLog(!showLog)} 
          style={styles.bellButton}
          title="System Logs"
        >
          <span style={{ fontSize: '1.2rem', filter: showLog ? 'drop-shadow(0 0 8px #00ff41)' : 'none' }}>
            🔔
          </span>
          {hasUnread && <div className="unread-pulse" style={styles.badge} />}
        </button>

        {showLog && (
          <div style={styles.logDropdown}>
            <div style={styles.logHeader}>
              <span>SYSTEM_LOG</span>
              <span onClick={(e) => { e.stopPropagation(); clearNotifications(); }} style={styles.clearBtn}>
                [ PURGE ]
              </span>
            </div>
            <div style={styles.logList}>
              {notifications.length === 0 ? (
                <div style={styles.logItem}>NO_ENTRY_FOUND</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={styles.logItem}>
                    <span style={{ color: '#00ff41', opacity: 0.5 }}>[{n.time}]</span> {n.msg}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={handleLogoClick}>
        <span style={{ color: '#00ff41', marginRight: '8px' }}>⚛️</span>
        <span style={{ letterSpacing: '2px' }}>SIGNAL ONE</span>
        <span style={styles.contextBadge}>
          //_{context}
          {isVault && `_${currentVault.toUpperCase()}`}
        </span>
      </div>

      <nav style={styles.nav}>
        {/* Admin Access button */}
        {isAdmin && (
          <button 
            onClick={() => navigate('/admin-portal')} 
            style={styles.adminNavButton}
          >
            [ ADMIN ACCESS ]
          </button>
        )}

        {isVault && (
          <div style={styles.vaultNavGroup}>
            <button 
              onClick={() => handleModeChange('STRATEGIC')} 
              style={viewMode === 'STRATEGIC' ? styles.activeNavButton : styles.navButton}
            >
              [ STRATEGIC SOC ]
            </button>
            <button 
              onClick={() => handleModeChange('TACTICAL')} 
              style={viewMode === 'TACTICAL' ? styles.activeNavButton : styles.navButton}
            >
              [ TACTICAL VAULT ]
            </button>
          </div>
        )}
        
        {renderNotificationLog()}
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
    backgroundColor: 'rgba(5, 5, 5, 0.9)', 
    backdropFilter: 'blur(15px)',
    color: 'white',
    borderBottom: '1px solid rgba(0, 255, 65, 0.2)',
    width: '100%',
    boxSizing: 'border-box',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: { fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', fontFamily: 'monospace' },
  contextBadge: { marginLeft: '15px', color: '#444', fontSize: '0.7rem', letterSpacing: '1px' },
  nav: { display: 'flex', alignItems: 'center', gap: '12px' },
  vaultNavGroup: { display: 'flex', gap: '10px', marginRight: '20px', borderRight: '1px solid #333', paddingRight: '20px' },
  navButton: { padding: '6px 15px', backgroundColor: 'transparent', color: '#00ff41', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace', transition: '0.2s' },
  activeNavButton: { padding: '6px 15px', backgroundColor: '#00ff41', color: 'black', border: '1px solid #00ff41', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 'bold' },
  adminNavButton: { padding: '6px 15px', backgroundColor: 'transparent', color: '#f0f', border: '1px solid #f0f', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace', marginRight: '10px' },
  bellButton: { background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative' as const, display: 'flex', alignItems: 'center', padding: '5px', color: '#00ff41', marginRight: '10px' },
  badge: { position: 'absolute' as const, top: '4px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ff4b2b', borderRadius: '50%', border: '1px solid #000' },
  authButton: { padding: '6px 15px', backgroundColor: 'transparent', color: '#ff4b2b', border: '1px solid #ff4b2b', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'monospace' },
  logDropdown: { position: 'absolute' as const, top: '45px', right: 0, width: '320px', backgroundColor: '#0a0a0a', border: '1px solid #00ff41', borderRadius: '4px', zIndex: 10001, padding: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.9)' },
  logHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#00ff41', borderBottom: '1px solid #222', paddingBottom: '6px', marginBottom: '10px', fontFamily: 'monospace' },
  logList: { maxHeight: '250px', overflowY: 'auto' as const, scrollbarWidth: 'thin' },
  logItem: { fontSize: '0.65rem', fontFamily: 'monospace', color: '#ccc', padding: '6px 0', borderBottom: '1px solid #1a1a1a', lineHeight: '1.4', textAlign: 'left' },
  clearBtn: { cursor: 'pointer', color: '#ff4b2b', fontWeight: 'bold' }
};

export default Header;