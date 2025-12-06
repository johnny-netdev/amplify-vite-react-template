// src/components/Todos.tsx

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../amplify/data/resource";

// --- Type Definitions ---
type Todo = Schema["Todo"]["type"] & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const client = generateClient<Schema>();

const Todos: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { authStatus } = useAuthenticator((context) => [
    context.authStatus,
  ]);

  // useEffect Hook for fetching Todos
  useEffect(() => {
    // Only run the query if the user is authenticated
    if (authStatus === 'authenticated') { 
        // Subscribes to the data stream
        const sub = client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items] as Todo[]), 
        });
        return () => sub.unsubscribe(); // Cleanup subscription
    }
  }, [authStatus]); // Reruns when authStatus changes

  // Create Todo function
  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  // Delete Todo function
  function deleteTodo(id: string) {
    client.models.Todo.delete({id});
  }

  return (
    <div style={{ padding: "0 20px" }}>
        <h1>My todos</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div style={{ display: 'flex' }}>
                {/* Only show the 'New' button if logged in */}
                {authStatus === 'authenticated' && <button onClick={createTodo}>+ new</button>}
            </div>
        </div>
        
        <hr />
        
        {/* MAIN CONTENT: Displayed only if authenticated */}
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
    </div>
  );
};

export default Todos;