import { useState } from "react";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-background pt-24 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-7xl font-bold text-foreground">TODO</h1>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            className="w-[200px] rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-green-600 px-5 py-2 text-white font-semibold shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Add
          </button>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {todos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No tasks yet. Add one above!</p>
          )}
          {todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className={`flex-1 text-xs text-muted-foreground ${todo.done ? "line-through opacity-50" : ""}`}>
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Index;
