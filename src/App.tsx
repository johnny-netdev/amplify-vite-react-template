// src/App.tsx

import { useState } from "react"; 
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import Header from "./Header";
import MatrixRain from "./components/MatrixRain"; 
import Todos from "./components/Todos"; 

// Define styles (placed outside the component to avoid re-creation on render)
const certStyles = {
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '150px',
        padding: '20px',
        flexWrap: 'wrap',
    } as const,
    certButton: {
        padding: '15px 25px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: 'rgba(0, 255, 0, 0.15)', // Translucent green fill
        border: '2px solid #00FF00',             // Neon green border
        color: '#00FF00',                        // Neon green text
        borderRadius: '8px',
        minWidth: '250px',
        textAlign: 'center' as const, // TSX requires 'as const' or explicit type for literal string styles
        transition: 'background-color 0.3s'
    } as const,
};


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
          <div style={certStyles.buttonContainer}>
              <button onClick={() => { console.log('Security+ clicked'); }} style={certStyles.certButton}>
                  Security+ 🛡️
              </button>
              <button onClick={() => { console.log('CISSP clicked'); }} style={certStyles.certButton}>
                  CISSP 🔒
              </button>
              <button onClick={() => { console.log('AWS SA Pro clicked'); }} style={certStyles.certButton}>
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