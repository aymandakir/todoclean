import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  position: number;
  category?: string | null;
}

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

const SortableTodoItem = ({ todo, onToggle, onDelete }: SortableTodoItemProps) => {
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
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
      >
        ×
      </button>
    </li>
  );
};

export default SortableTodoItem;
