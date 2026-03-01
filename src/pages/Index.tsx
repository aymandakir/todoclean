import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTodoItem from "@/components/SortableTodoItem";
import TodoHeader from "@/components/TodoHeader";
import TodoInput from "@/components/TodoInput";
import FilterTabs from "@/components/FilterTabs";
import { useTodos } from "@/hooks/use-todos";
import { useSuggestions } from "@/hooks/use-suggestions";
import { useProfile } from "@/hooks/use-profile";

const AiSuggestions = lazy(() => import("@/components/AiSuggestions"));

const Index = () => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const { todos, loading, fetchTodos, addTodo, toggleTodo, deleteTodo, clearCompleted, handleDragEnd } = useTodos();
  const { displayName, avatarUrl, fetchProfile } = useProfile();
  const { suggestions, loading: loadingSuggestions, fetchSuggestions, addSuggestion, dismissSuggestion } = useSuggestions(todos, addTodo);

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
  }, [fetchTodos, fetchProfile]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "completed") return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const hasCompleted = useMemo(() => todos.some((t) => t.done), [todos]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-md" role="main">
        <h1 className="sr-only">Todo App — Manage your tasks</h1>

        <TodoHeader
          displayName={displayName}
          avatarUrl={avatarUrl}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
        />

        <TodoInput onAdd={addTodo} />

        <FilterTabs filter={filter} onFilterChange={setFilter} />

        {/* Task List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2" aria-label="Task list">
              {loading && (
                <p className="text-center text-muted-foreground py-8" aria-live="polite">Loading…</p>
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

        {hasCompleted && (
          <button
            onClick={clearCompleted}
            className="mt-4 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
          >
            Clear completed
          </button>
        )}

        <Suspense fallback={null}>
          <AiSuggestions
            suggestions={suggestions}
            loading={loadingSuggestions}
            onFetch={fetchSuggestions}
            onAdd={addSuggestion}
            onDismiss={dismissSuggestion}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
