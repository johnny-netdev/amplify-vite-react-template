// src/App.tsx

import { useState, useEffect } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import { client } from "./amplify-client";
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import './App.css'; // Importing CSS for tile styles
import KanbanBoard from "./components/KanbanBoard";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import CISSPApp from './apps/CISSPApp';
import SecurityPlusApp from './apps/SecurityPlusApp';
import AWSSAPApp from './apps/AWSSAPApp';

function App() { 
  const { authStatus, user } = useAuthenticator((context) => [
    context.authStatus,
    context.user,
  ]);
  
  const [showTodos, setShowTodos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authStatus === 'authenticated' && user) {
      const checkForProfile = async () => {
        try {
          const { data: profiles } = await client.models.UserProfile.list({
            filter: {
              userId: { eq: user.userId }
            }
          });

          if (profiles.length === 0) {
            console.log('No profile found, creating one...');
            const { data: newProfile, errors } = await client.models.UserProfile.create({
              userId: user.userId,
              username: user.username,
              bio: "This is a default bio.",
            });
            if (errors) {
              console.error('Error creating user profile:', errors);
            } else {
              console.log('Successfully created new user profile:', newProfile);
            }
          } else {
            console.log('User profile already exists:', profiles[0]);
          }
        } catch (error) {
          console.error('Error checking/creating user profile:', error);
        }
      };

      checkForProfile();
    }
  }, [authStatus, user]);

  const toggleTodos = () => {
      setShowTodos(prev => !prev);
  };

  // Renders the certification buttons in the main area
  const renderCertButtons = () => {
    return (
      <div
        className="cert-tiles-container"
        style={{
          background: 'rgba(20,20,20,0.95)',
          zIndex: 9999,
          minHeight: '220px',
          borderRadius: '24px',
          border: '4px solid #222',
          boxSizing: 'border-box'
        }}
      >
        <div className="cert-button" onClick={() => { navigate('/securityplus'); }} role="button" tabIndex={0}>
          Security+ 🛡️
        </div>
        <div className="cert-button" onClick={() => { navigate('/CISSP'); }} role="button" tabIndex={0}>
          CISSP 🔒
        </div>
        <div className="cert-button" onClick={() => { navigate('/awssap'); }} role="button" tabIndex={0}>
          AWS Solutions Architect Professional ☁️
        </div>
      </div>
    );
  };
  
  return (
    <Routes>
      <Route
        path="/"
        element={
          authStatus === 'authenticated' ? (
            <>
              <MatrixRain />
              <Header onToggleTodos={toggleTodos} showTodos={showTodos} />
              <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', minHeight: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {renderCertButtons()}
                </div>
                {showTodos && <KanbanBoard />}
              </main>
              <Authenticator />
            </>
          ) : (
            <Authenticator />
          )
        }
      />
      <Route path="/securityplus" element={<SecurityPlusApp />} />
      <Route path="/CISSP" element={<CISSPApp />} />
      <Route path="/awssap" element={<AWSSAPApp />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;