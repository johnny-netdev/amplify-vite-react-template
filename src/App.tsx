// src/App.tsx
import { useState, useEffect } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import { client } from "./amplify-client";
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import './App.css'; 
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import CISSPApp from './apps/CISSPApp';
import SecurityPlusApp from './apps/SecurityPlusApp';
import AWSSAPApp from './apps/AWSSAPApp';
import KanbanBoard from "./components/KanbanBoard";


function App() { 
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  
  const [showTodos, setShowTodos] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // To track current path for the Header context
  const [viewMode, setViewMode] = useState<'LOBBY' | 'STRATEGIC' | 'TACTICAL'>('LOBBY');

  // Sync profile logic
  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      const checkForProfile = async () => {
        try {
          const { data: profiles } = await client.models.UserProfile.list({
            filter: { userId: { eq: user.userId } }
          });

          if (profiles.length === 0) {
            await client.models.UserProfile.create({
              userId: user.userId,
              username: user.username,
              bio: "This is a default bio.",
            });
          }
        } catch (error) {
          console.error('Error checking/creating user profile:', error);
        }
      };
      checkForProfile();
    }
  }, [authStatus, user]);

  const renderCertButtons = () => {
    const certifications = [
      { id: 'CISSP', path: '/CISSP', label: 'CISSP', desc: 'Cybersecurity Management' },
      { id: 'securityplus', path: '/securityplus', label: 'Security+', desc: 'Foundational Security' },
      { id: 'awssap', path: '/awssap', label: 'AWS SAP', desc: 'Cloud Architecture' }
    ];

    return (
      /* ⭐️ Wrap the buttons in the Glassmorphism Container */
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
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#000' }}>
      {/* 1. HEADER (Remains global so it's always there) */}
      {authStatus === 'authenticated' && (
        <Header 
          onToggleTodos={() => setShowTodos(!showTodos)} 
          showTodos={showTodos}
          context={location.pathname === '/' ? 'LOBBY' : 'VAULT'}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}

      {/* 2. THE VIEWPORT */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              authStatus === 'authenticated' ? (
                <>
                  <MatrixRain /> 
                  <div style={styles.lobbyContainer}>
                    <h2 style={styles.lobbyTitle}>Certification Domains</h2>
                    {renderCertButtons()} 
                  </div>
                </>
              ) : (
                <Authenticator />
              )
            }
          />
          {/* ⭐️ Pass viewMode down so the Vaults know which screen to show */}
          <Route path="/securityplus" element={<SecurityPlusApp viewMode={viewMode} setViewMode={setViewMode} />} />
          <Route path="/CISSP" element={<CISSPApp viewMode={viewMode} setViewMode={setViewMode} />} />
          <Route path="/awssap" element={<AWSSAPApp viewMode={viewMode} setViewMode={setViewMode} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {showTodos && (
          <div style={styles.kanbanOverlay}>
            <KanbanBoard />
          </div>
        )}
      </main>
    </div>
  );
}

// Visual Styling for Signal One Aesthetics
const styles = {
  lobbyContainer: {
    display: 'flex', 
    flexDirection: 'column' as const, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    position: 'relative',
    zIndex: 2
  },
  lobbyTitle: {
    color: '#00ff41',
    letterSpacing: '5px',
    marginBottom: '2rem',
    textShadow: '0 0 10px #00ff41'
  },
  // The Glassmorphism Container for the buttons
  certGrid: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '40px',
    display: 'flex',
    gap: '30px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)'
  },
  certTile: {
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    padding: '20px 40px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: '0.3s',
    letterSpacing: '2px'
  },
  tileHeader: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  tileDesc: {
    fontSize: '0.8rem',
    opacity: 0.7,
    marginBottom: '10px'
  },
  tileFooter: {
    fontSize: '0.7rem',
    borderTop: '1px solid rgba(0, 255, 65, 0.3)',
    paddingTop: '10px',
    marginTop: 'auto'
  },
  kanbanOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 100,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
} as const;

export default App;