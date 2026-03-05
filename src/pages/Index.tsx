import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
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
import TodoInput, { type TodoInputHandle } from "@/components/TodoInput";
import FilterTabs from "@/components/FilterTabs";
import TodoProgress from "@/components/TodoProgress";
import TodoSearch from "@/components/TodoSearch";
import TodoSort, { type SortOption } from "@/components/TodoSort";
import { useTodos } from "@/hooks/use-todos";
import { useSubtasks } from "@/hooks/use-subtasks";
import { useProfile } from "@/hooks/use-profile";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const Index = () => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("manual");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<TodoInputHandle>(null);

  const { todos, loading, fetchTodos, addTodo, toggleTodo, deleteTodo, updateTodo, clearCompleted, handleDragEnd } = useTodos();
  const { subtasksByTodo, fetchSubtasks, addSubtask, toggleSubtask, deleteSubtask } = useSubtasks();
  const { displayName, avatarUrl, fetchProfile } = useProfile();

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

  const priorityValue: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const filteredTodos = useMemo(() => {
    let result = todos;
    if (filter === "active") result = result.filter((t) => !t.done);
    if (filter === "completed") result = result.filter((t) => t.done);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => t.text.toLowerCase().includes(q));
    }
    if (sortBy === "priority") {
      result = [...result].sort((a, b) => (priorityValue[a.priority] ?? 1) - (priorityValue[b.priority] ?? 1));
    } else if (sortBy === "due_date") {
      result = [...result].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    } else if (sortBy === "alphabetical") {
      result = [...result].sort((a, b) => a.text.localeCompare(b.text));
    }
    return result;
  }, [todos, filter, searchQuery, sortBy]);

  const hasCompleted = useMemo(() => todos.some((t) => t.done), [todos]);
  const completedCount = useMemo(() => todos.filter((t) => t.done).length, [todos]);
  const prevAllDone = useRef(false);

  useEffect(() => {
    const allDone = todos.length > 0 && completedCount === todos.length;
    if (allDone && !prevAllDone.current) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
    prevAllDone.current = allDone;
  }, [todos.length, completedCount]);

  const toggleDark = useCallback(() => setDark((d) => !d), []);
  const focusInput = useCallback(() => inputRef.current?.focus(), []);
  const toggleHelp = useCallback(() => setShowHelp((v) => !v), []);

  useKeyboardShortcuts({
    onFocusInput: focusInput,
    onToggleDark: toggleDark,
    onFilterChange: setFilter,
    onShowHelp: toggleHelp,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <main className="w-full max-w-md" role="main">
        <h1 className="sr-only">Todo App — Manage your tasks</h1>

        <TodoHeader
          displayName={displayName}
          avatarUrl={avatarUrl}
          dark={dark}
          onToggleDark={toggleDark}
          showHelp={showHelp}
          onShowHelpChange={setShowHelp}
        />

        <TodoInput ref={inputRef} onAdd={addTodo} />

        <FilterTabs filter={filter} onFilterChange={setFilter} />

        {/* Compact search + sort row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <TodoSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <TodoSort value={sortBy} onChange={setSortBy} />
        </div>

        <TodoProgress total={todos.length} completed={completedCount} />

        {/* Task List */}
        <DndContext sensors={sortBy === "manual" ? sensors : []} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                      subtasks={subtasksByTodo[todo.id]}
                      onFetchSubtasks={fetchSubtasks}
                      onAddSubtask={addSubtask}
                      onToggleSubtask={toggleSubtask}
                      onDeleteSubtask={deleteSubtask}
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
      </main>
    </div>
  );
};

export default Index;
