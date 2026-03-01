import { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import type { Todo } from "@/types/todo";

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Personal: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Health: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Learning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Other: "bg-muted text-muted-foreground",
};

function getDueDateInfo(dueDateStr: string | null | undefined, done: boolean) {
  if (!dueDateStr || done) return null;
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(dueDateStr));
  const diff = differenceInDays(due, today);

  if (diff < 0)
    return { label: "Overdue", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
  if (diff === 0)
    return { label: "Today", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
  if (diff === 1)
    return { label: "Tomorrow", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
  if (diff <= 3)
    return { label: `${diff}d`, className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  if (diff <= 7)
    return { label: `${diff}d`, className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" };
  return { label: `${diff}d`, className: "bg-muted text-muted-foreground" };
}

const SortableTodoItem = memo(({ todo, onToggle, onDelete }: SortableTodoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueInfo = getDueDateInfo(todo.due_date, todo.done);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4 accent-primary cursor-pointer"
      />
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span
          className={`text-xs text-muted-foreground truncate ${
            todo.done ? "line-through opacity-50" : ""
          }`}
        >
          {todo.text}
        </span>
        {todo.category && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              categoryColors[todo.category] || categoryColors.Other
            }`}
          >
            {todo.category}
          </span>
        )}
        {dueInfo && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${dueInfo.className}`}
          >
            {dueInfo.label}
          </span>
        )}
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
      >
        ×
      </button>
    </li>
  );
});

SortableTodoItem.displayName = "SortableTodoItem";
export default SortableTodoItem;
