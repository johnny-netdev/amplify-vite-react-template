import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";


type Todo = Schema["Todo"]["type"] & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { signOut } = useAuthenticator((context) => [context.signOut]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({id});
  }

  return (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <button onClick={signOut} style={{ marginLeft: "8px" }}>Sign Out</button>;
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.content}
            <span style={{ cursor: "pointer", marginLeft: "8px" }} onClick={() => deleteTodo(todo.id)}>🗑️</span>
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
