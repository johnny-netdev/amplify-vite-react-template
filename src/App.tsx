import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
// 💡 We still need to import these, but we will ONLY use the hook and the component now
import { useAuthenticator, Authenticator } from "@aws-amplify/ui-react"; 

// --- Type Definitions (same as before) ---
type Todo = Schema["Todo"]["type"] & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const client = generateClient<Schema>();

// --- App Component (Root) ---
// This now contains all the logic and is a child of the Provider in main.tsx
function App() { 
  const [todos, setTodos] = useState<Todo[]>([]);
  const { authStatus, signOut, toSignIn } = useAuthenticator((context) => [
    context.authStatus,
    context.signOut,
    context.toSignIn,
  ]);
  // ... (rest of your useEffect, createTodo, deleteTodo, renderAuthButton functions) ...
  
  // useEffect Hook for fetching Todos
  useEffect(() => {
    // Only run the query if the user is authenticated
    if (authStatus === 'authenticated') { 
        // 💡 Subscribes to the data stream
        const sub = client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items] as Todo[]), 
        });
        return () => sub.unsubscribe(); // Cleanup subscription when the component unmounts
    }
  }, [authStatus]); // Reruns when authStatus changes

  // Create Todo function (using 'content' as determined by your schema)
  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  // Delete Todo function
  function deleteTodo(id: string) {
    client.models.Todo.delete({id});
  }

  // Helper function to render the auth button based on state
  const renderAuthButton = () => {
    if (authStatus === 'authenticated') {
      return (
        <button onClick={signOut} style={{ marginLeft: "8px" }}>Sign Out</button>
      );
    } 
    // If not authenticated, show the Sign In button
    return (
      <button onClick={toSignIn} style={{ marginLeft: "8px" }}>Sign In</button>
    );
  };
  
  return (
    <main>
      {/* ⭐️ HEADER AREA: Contains Title, New Button, and Auth Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
        <h1>My todos</h1>
        <div style={{ display: 'flex' }}>
          {/* Only show the 'New' button if logged in */}
          {authStatus === 'authenticated' && <button onClick={createTodo}>+ new</button>}
          {/* ⭐️ RENDER THE CONDITIONAL AUTH BUTTON */}
          {renderAuthButton()}
        </div>
      </div>
      
      <hr />
      
      {/* ⭐️ MAIN CONTENT: Displayed only if authenticated */}
      {authStatus === 'authenticated' ? (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.content} 
              <span 
                style={{ cursor: "pointer", marginLeft: "8px" }} 
                onClick={() => deleteTodo(todo.id)}
              >
                🗑️
              </span>
            </li>
          ))}
        </ul>
      ) : (
        // Show a prompt when signed out
        <h2>Please sign in to view and manage your Todo list.</h2>
      )}

      {/* Footer / Info Section */}
      <div>
        🥳 App successfully hosted.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      
      <Authenticator /> 
    </main>
  );
}

// 💡 Export the simplified App component
export default App;