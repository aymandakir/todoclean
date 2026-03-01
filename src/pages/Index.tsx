import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import CategoryFilter from "@/components/CategoryFilter";
import TodoProgress from "@/components/TodoProgress";
import { useTodos } from "@/hooks/use-todos";
import { useSuggestions } from "@/hooks/use-suggestions";
import { useProfile } from "@/hooks/use-profile";

const AiSuggestions = lazy(() => import("@/components/AiSuggestions"));

const Index = () => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const { todos, loading, fetchTodos, addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, handleDragEnd } = useTodos();
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
    let result = todos;
    if (filter === "active") result = result.filter((t) => !t.done);
    if (filter === "completed") result = result.filter((t) => t.done);
    if (categoryFilter) result = result.filter((t) => t.category === categoryFilter);
    return result;
  }, [todos, filter, categoryFilter]);

  const hasCompleted = useMemo(() => todos.some((t) => t.done), [todos]);
  const completedCount = useMemo(() => todos.filter((t) => t.done).length, [todos]);

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

        <CategoryFilter todos={todos} selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />

        <TodoProgress total={todos.length} completed={completedCount} />

        {/* Task List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2" aria-label="Task list">
              {loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground py-8"
                  aria-live="polite"
                >
                  Loading…
                </motion.p>
              )}
              {!loading && filteredTodos.length === 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-muted-foreground py-8"
                >
                  {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks.`}
                </motion.p>
              )}
              <AnimatePresence initial={false}>
                {filteredTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <SortableTodoItem
                      todo={todo}
                      onToggle={toggleTodo}
                      onDelete={deleteTodo}
                      onUpdate={updateTodo}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
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
