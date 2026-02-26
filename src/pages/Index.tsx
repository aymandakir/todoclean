import { useState, useEffect, useCallback } from "react";
import { Moon, Sun, LogOut, Sparkles, Plus, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTodoItem from "@/components/SortableTodoItem";
import Logo from "@/components/Logo";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  position: number;
}

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    fetchTodos();
    fetchProfile();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("id, text, done, position")
      .order("position", { ascending: true });

    if (error) {
      toast({ title: "Error loading todos", description: error.message, variant: "destructive" });
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) {
      setDisplayName(data.display_name);
      setAvatarUrl(data.avatar_url);
    }
  };

  const addTodo = async () => {
    if (!input.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPosition = todos.length;
    const { data, error } = await supabase
      .from("todos")
      .insert({ text: input.trim(), user_id: user.id, position: newPosition })
      .select("id, text, done, position")
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

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-tasks", {
        body: { todos: todos.map((t) => ({ text: t.text, done: t.done })) },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI error", description: data.error, variant: "destructive" });
      } else {
        setSuggestions((data?.suggestions || []).map((s: { title: string }) => s.title));
      }
    } catch (e: any) {
      toast({ title: "Failed to get suggestions", description: e.message, variant: "destructive" });
    }
    setLoadingSuggestions(false);
  };

  const addSuggestion = async (text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newPosition = todos.length;
    const { data, error } = await supabase
      .from("todos")
      .insert({ text, user_id: user.id, position: newPosition })
      .select("id, text, done, position")
      .single();
    if (!error && data) {
      setTodos([...todos, data]);
      setSuggestions(suggestions.filter((s) => s !== text));
      toast({ title: "Task added!" });
    }
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex).map((t, i) => ({ ...t, position: i }));
    setTodos(reordered);

    // Persist new positions
    const updates = reordered.map((t) =>
      supabase.from("todos").update({ position: t.position }).eq("id", t.id)
    );
    await Promise.all(updates);
  }, [todos]);

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/profile")} aria-label="Profile">
              <Avatar className="h-10 w-10 border border-border cursor-pointer hover:ring-2 hover:ring-ring transition-all">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : null}
                <AvatarFallback className="text-sm font-semibold">
                  {displayName?.charAt(0)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            </button>
            <div>
              <Logo className="text-4xl leading-none" />
              {displayName && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(() => {
                    const h = new Date().getHours();
                    const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
                    return `${greeting}, ${displayName}`;
                  })()}
                </p>
              )}
            </div>
          </div>
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
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
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        {todos.some((t) => t.done) && (
          <button
            onClick={clearCompleted}
            className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
          >
            Clear completed
          </button>
        )}

        {/* AI Suggestions */}
        <button
          onClick={fetchSuggestions}
          disabled={loadingSuggestions}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/80 transition-colors"
        >
          {loadingSuggestions ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-primary" />
              Suggest tasks with AI
            </>
          )}
        </button>

        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Suggestions
            </p>
            {suggestions.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-accent/50 px-4 py-2.5"
              >
                <span className="flex-1 text-xs text-foreground">{s}</span>
                <button
                  onClick={() => addSuggestion(s)}
                  className="rounded-md bg-primary p-1 text-primary-foreground hover:bg-primary/90 transition-colors"
                  aria-label="Add suggestion"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setSuggestions(suggestions.filter((x) => x !== s))}
                  className="rounded-md border border-border p-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Dismiss suggestion"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
