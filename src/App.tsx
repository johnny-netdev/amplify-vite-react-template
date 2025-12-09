// src/App.tsx

import { useState } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import Todos from "./components/Todos"; 

function App() { 
  const { authStatus } = useAuthenticator((context) => [
    context.authStatus,
  ]);
  
  const [showTodos, setShowTodos] = useState(false);

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
          minWidth: '600px',
          minHeight: '220px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '24px',
          border: '4px solid #222'
        }}
      >
        <button onClick={() => { console.log('Security+ clicked'); }} className="cert-button">
          Security+ 🛡️
        </button>
        <button onClick={() => { console.log('CISSP clicked'); }} className="cert-button">
          CISSP 🔒
        </button>
        <button onClick={() => { console.log('AWS SA Pro clicked'); }} className="cert-button">
          AWS Solutions Architect Professional ☁️
        </button>
      </div>
    );
  };
  
  return (
    <>
      <MatrixRain />
      <Header onToggleTodos={toggleTodos} showTodos={showTodos} />
      <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Centered tiles inside main, only when authenticated and todos are hidden */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          {renderCertButtons()}
        </div>
        {/* Conditionally render the Todos component (Kanban Board) */}
        {showTodos && <Todos />}
        {/* Footer / Info Section */}
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
  );
}

export default App;