import { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("id, text, done")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error loading todos", description: error.message, variant: "destructive" });
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ text: input.trim(), user_id: user.id })
      .select("id, text, done")
      .single();

    if (error) {
      toast({ title: "Error adding todo", description: error.message, variant: "destructive" });
    } else if (data) {
      setTodos([...todos, data]);
      setInput("");
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from("todos")
      .update({ done: !todo.done })
      .eq("id", id);

    if (!error) {
      setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) {
      setTodos(todos.filter((t) => t.id !== id));
    }
  };

  const clearCompleted = async () => {
    const completedIds = todos.filter((t) => t.done).map((t) => t.id);
    const { error } = await supabase.from("todos").delete().in("id", completedIds);
    if (!error) {
      setTodos(todos.filter((t) => !t.done));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-7xl font-bold text-foreground">TODO</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            className="w-[200px] rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Add
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-4 rounded-lg border border-border bg-card p-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="space-y-2">
          {loading && (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          )}
          {!loading && filteredTodos.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks.`}
            </p>
          )}
          {filteredTodos.map((todo) => (
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
              <span
                className={`flex-1 text-xs text-muted-foreground ${
                  todo.done ? "line-through opacity-50" : ""
                }`}
              >
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

        {todos.some((t) => t.done) && (
          <button
            onClick={clearCompleted}
            className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>
    </div>
  );
};

export default Index;
