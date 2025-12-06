// src/App.tsx

import { useState } from "react";
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import Header from "./Header";
import ThreeDBackground from "./components/ThreeDBackground"; 
import Todos from "./components/Todos"; 



// --- App Component (Root) ---
function App() { 
  
  useAuthenticator((context) => [
    context.authStatus,
  ]);

  const [showTodos, setShowTodos] = useState(false);
  const toggleTodos = () => {
      setShowTodos(prev => !prev);
  };
  
  return (
    // ⭐️ Use a React Fragment (<>...</>) to render top-level siblings
    <> 
      {/* 1. 3D BACKGROUND (fixed position, z-index: -1) */}
      <ThreeDBackground />

      <Header onToggleTodos={toggleTodos} showTodos={showTodos} /> 
      
      {/* Main content container, positioned over the background */}
      <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white' }}>
        
        {/* The Todos component is only rendered if showTodos is true. */}
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
      
      {/* 3. AUTHENTICATOR */}
      <Authenticator /> 
    </>
  );
}

// 💡 Export the simplified App component
export default App;