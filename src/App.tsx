// src/App.tsx

import { useState } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import './App.css'; // Importing CSS for tile styles
import Todos from "./components/Todos";
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import CISSPApp from './apps/CISSPApp';
import SecurityPlusApp from './apps/SecurityPlusApp';
import AWSSAPApp from './apps/AWSSAPApp';

function App() { 
  const { authStatus } = useAuthenticator((context) => [
    context.authStatus,
  ]);
  
  const [showTodos, setShowTodos] = useState(false);
  const navigate = useNavigate();

  const toggleTodos = () => {
      setShowTodos(prev => !prev);
  };

  // ⭐️ NEW FUNCTION: Renders the certification buttons in the main area
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
          <>
            <MatrixRain />
            <Header onToggleTodos={toggleTodos} showTodos={showTodos} />
            <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', minHeight: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {authStatus === 'authenticated' && renderCertButtons()}
              </div>
              {showTodos && <Todos />}
              <div style={{ padding: '20px 0 0 0' }}>
                🥳 App successfully hosted.
                <br />
                <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                  Review next step of this tutorial.
                </a>
              </div>
            </main>
            <Authenticator />
          </>
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