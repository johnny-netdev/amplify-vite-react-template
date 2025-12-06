// src/App.tsx

import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 
import Header from "./Header";
import ThreeDBackground from "./components/ThreeDBackground"; 
import Todos from "./components/Todos"; 



// --- App Component (Root) ---
function App() { 
  
  useAuthenticator((context) => [
    context.authStatus,
  ]);
  
  return (
    // ⭐️ FIX: Use a React Fragment (<>...</>) to render top-level siblings
    <> 
      {/* 1. 3D BACKGROUND (fixed position, z-index: -1) */}
      <ThreeDBackground />

      {/* 2. HEADER AND MAIN CONTENT (z-index: 1 or higher) */}
      <Header /> 
      
      {/* Main content container, positioned over the background */}
      <main style={{ padding: "0 20px", position: 'relative', zIndex: 1, color: 'white' }}>
        
        {/* ⭐️ INTEGRATION POINT: The entire Todo list is now rendered here */}
        <Todos />
        
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