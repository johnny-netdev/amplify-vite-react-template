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
          <div className="button-container">
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

      {/* Header now receives the toggle props */}
      <Header onToggleTodos={toggleTodos} showTodos={showTodos} /> 
      
      <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white' }}>
        
        {/* ⭐️ INTEGRATION POINT: Show buttons only when authenticated AND when the Todo/Kanban board is hidden */}
        {authStatus === 'authenticated' && !showTodos && renderCertButtons()}

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