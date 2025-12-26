// src/App.tsx
import { useState, useEffect, useCallback } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import { client } from "./amplify-client";
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import './App.css'; 
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import CISSPApp from './apps/CISSPApp';
import SecurityPlusApp from './apps/SecurityPlusApp';
import AWSSAPApp from './apps/AWSSAPApp';
import KanbanBoard from "./components/kanban/KanbanBoard";

// Removed the 'three/tsl' import as it was likely a ghost import.

function App() { 
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  
  const [showTodos, setShowTodos] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadingModule, setIsLoadingModule] = useState(false);
  const [targetDrillId, setTargetDrillId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{id: string, msg: string, time: string}[]>([]);

  const [viewMode, setViewMode] = useState<'LOBBY' | 'STRATEGIC' | 'TACTICAL'>(() => {
    const saved = localStorage.getItem('vaultViewMode');
    return (saved as 'LOBBY' | 'STRATEGIC' | 'TACTICAL') || 'LOBBY';
  });

  // Memoized to prevent unnecessary re-renders in children
  const addNotification = useCallback((message: string) => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      msg: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  useEffect(() => {
    localStorage.setItem('vaultViewMode', viewMode);
  }, [viewMode]);

  const handleLaunchDrill = (drillId: string, certPath?: string) => {
    setIsLoadingModule(true);
    setShowTodos(false); 

    const logEntry = certPath ? certPath.toUpperCase() : "SYSTEM_CORE";
    addNotification(`INITIATING_DRILL_SEQUENCE: ${logEntry}`);

    setTimeout(() => {
      setTargetDrillId(drillId);
      setViewMode('TACTICAL');

      if (certPath) {
        const formattedPath = certPath.startsWith('/') ? certPath : `/${certPath.toLowerCase()}`;
        const finalPath = formattedPath === '/cissp' ? '/CISSP' : formattedPath;
        navigate(finalPath);
      }
      
      // Slight delay to allow route transition to complete smoothly
      setTimeout(() => setIsLoadingModule(false), 300);
    }, 1500); 
  };

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      const checkForProfile = async () => {
        try {
          const { data: profiles } = await client.models.UserProfile.list({
            filter: { userId: { eq: user.userId } }
          });
          if (profiles.length === 0) {
            await client.models.UserProfile.create({
              userId: user.userId, username: user.username, bio: "User profile initialized.",
            });
            addNotification("NEW_PROFILE_CREATED: SUCCESS");
          }
        } catch (error) { 
          console.error(error); 
          addNotification("PROFILE_SYNC_ERROR: CHECK_CONSOLE");
        }
      };
      checkForProfile();
    }
  }, [authStatus, user, addNotification]);

  const renderCertButtons = () => {
    const certifications = [
      { id: 'CISSP', path: '/CISSP', label: 'CISSP', desc: 'Cybersecurity Management' },
      { id: 'securityplus', path: '/securityplus', label: 'Security+', desc: 'Foundational Security' },
      { id: 'awssap', path: '/awssap', label: 'AWS SAP', desc: 'Cloud Architecture' }
    ];

    return (
      <div style={styles.certGrid}>
        {certifications.map((cert) => (
          <div
            key={cert.id}
            onClick={() => {
              setViewMode('STRATEGIC');
              navigate(cert.path);      
            }}
            style={styles.certTile}
          >
            <div style={styles.tileHeader}>{cert.label}</div>
            <div style={styles.tileDesc}>{cert.desc}</div>
            <div style={styles.tileFooter}>[ ACCESS_VAULT ]</div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#000', overflowX: 'hidden' }}>
      {authStatus === 'authenticated' && (
        <Header 
          onToggleTodos={() => setShowTodos(!showTodos)} 
          showTodos={showTodos}
          context={location.pathname === '/' ? 'LOBBY' : 'VAULT'}
          viewMode={viewMode}
          setViewMode={setViewMode}
          notifications={notifications}
          clearNotifications={() => setNotifications([])}
        />
      )}

      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/" element={
              authStatus === 'authenticated' ? (
                <>
                  <MatrixRain /> 
                  <div style={styles.lobbyContainer}>
                    <h2 style={styles.lobbyTitle}>Certification Domains</h2>
                    {renderCertButtons()} 
                  </div>
                </>
              ) : ( <Authenticator /> )
            }
          />
          <Route path="/securityplus" element={
            <SecurityPlusApp viewMode={viewMode} setViewMode={setViewMode} preLoadedDrillId={targetDrillId} onDrillStarted={() => setTargetDrillId(null)} />
          } />
          <Route path="/CISSP" element={
            <CISSPApp viewMode={viewMode} setViewMode={setViewMode} preLoadedDrillId={targetDrillId} onDrillStarted={() => setTargetDrillId(null)} />
          } />
          <Route path="/awssap" element={
            <AWSSAPApp viewMode={viewMode} setViewMode={setViewMode} preLoadedDrillId={targetDrillId} onDrillStarted={() => setTargetDrillId(null)} />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {showTodos && (
          <div style={styles.kanbanOverlay} onClick={() => setShowTodos(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '95%', maxWidth: '1400px', maxHeight: '90vh', overflowY: 'auto' }}>
              <KanbanBoard 
              onLaunchDrill={handleLaunchDrill}
              addNotification={addNotification}
              />
            </div>
          </div>
        )}
      </main>

      {isLoadingModule && (
        <div style={styles.loaderOverlay}>
          <div style={styles.loaderContent}>
            <div className="glitch-text" style={styles.loaderText}>
              [ LOADING MODULES ]
            </div>
            <div style={styles.loaderBarContainer}>
              <div className="loading-bar-fill"></div>
            </div>
            <div style={styles.systemStatus}>
              SYSTEM_ACCESS: GRANTED...<br/>
              ENCRYPT_TUNNEL: ACTIVE...<br/>
              FETCHING_DATA: {targetDrillId || 'CORE_LOAD'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  lobbyContainer: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', minHeight: '100vh', position: 'relative', zIndex: 2 },
  lobbyTitle: { color: '#00ff41', letterSpacing: '5px', marginBottom: '2rem', textShadow: '0 0 10px #00ff41', fontFamily: 'monospace' },
  certGrid: { background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '40px', display: 'flex', gap: '30px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)' },
  certTile: { background: 'rgba(0, 255, 65, 0.1)', border: '1px solid #00ff41', color: '#00ff41', padding: '20px 40px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', transition: '0.3s', letterSpacing: '2px', fontFamily: 'monospace', textAlign: 'center' as const },
  tileHeader: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px' },
  tileDesc: { fontSize: '0.8rem', opacity: 0.7, marginBottom: '10px' },
  tileFooter: { fontSize: '0.7rem', borderTop: '1px solid rgba(0, 255, 65, 0.3)', paddingTop: '10px', marginTop: 'auto' },
  kanbanOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loaderOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' },
  loaderContent: { textAlign: 'center' as const, width: 'fit-content', minWidth: '300px' },
  loaderText: { color: '#00ff41', fontSize: '1.6rem', marginBottom: '20px', letterSpacing: '3px', whiteSpace: 'nowrap' as const },
  loaderBarContainer: { width: '100%', height: '2px', background: '#111', borderRadius: '2px', overflow: 'hidden', border: '1px solid #003300' },
  systemStatus: { color: '#003300', fontSize: '0.7rem', marginTop: '15px', textAlign: 'left' as const, lineHeight: '1.5', fontFamily: 'monospace' }
} as const;

export default App;