import { memo, useMemo } from "react";
import { X } from "lucide-react";
import type { Todo } from "@/types/todo";

interface CategoryFilterProps {
  todos: Todo[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categoryColors: Record<string, string> = {
  Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Personal: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  Health: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  Learning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800",
};

const CategoryFilter = memo(({ todos, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    todos.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats).sort();
  }, [todos]);

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4" role="group" aria-label="Filter by category">
      {selectedCategory && (
        <button
          onClick={() => onCategoryChange(null)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear category filter"
        >
          All
          <X className="h-3 w-3" />
        </button>
      )}
      {categories.map((cat) => {
        const isActive = selectedCategory === cat;
        const colorClass = categoryColors[cat] || "bg-muted text-muted-foreground border-border";
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(isActive ? null : cat)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${colorClass} ${
              isActive ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : "opacity-70 hover:opacity-100"
            }`}
            aria-pressed={isActive}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
});

CategoryFilter.displayName = "CategoryFilter";
export default CategoryFilter;
