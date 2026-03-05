import { memo, useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CalendarIcon, X, Repeat, ChevronDown } from "lucide-react";
import { differenceInDays, parseISO, startOfDay, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Todo, Priority, Recurrence } from "@/types/todo";
import SubtaskList from "@/components/SubtaskList";
import type { Subtask } from "@/hooks/use-subtasks";

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { text?: string; due_date?: string | null; priority?: Priority; recurrence?: Recurrence | null }) => Promise<boolean>;
  subtasks?: Subtask[];
  onFetchSubtasks?: (todoId: string) => void;
  onAddSubtask?: (todoId: string, text: string) => Promise<void>;
  onToggleSubtask?: (todoId: string, subtaskId: string) => Promise<void>;
  onDeleteSubtask?: (todoId: string, subtaskId: string) => Promise<void>;
  isDragDisabled?: boolean;
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

const priorityConfig: Record<Priority, { dot: string; label: string }> = {
  low: { dot: "bg-emerald-400", label: "Low" },
  medium: { dot: "bg-amber-400", label: "Medium" },
  high: { dot: "bg-red-400", label: "High" },
};

const priorityOrder: Priority[] = ["low", "medium", "high"];

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

const SortableTodoItem = memo(({ todo, onToggle, onDelete, onUpdate, subtasks, onFetchSubtasks, onAddSubtask, onToggleSubtask, onDeleteSubtask, isDragDisabled }: SortableTodoItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !!isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueInfo = getDueDateInfo(todo.due_date, todo.done);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const saveText = async () => {
    const trimmed = editText.trim().slice(0, 200);
    setEditing(false);
    if (!trimmed || trimmed === todo.text) {
      setEditText(todo.text);
      return;
    }
    const success = await onUpdate(todo.id, { text: trimmed });
    if (!success) setEditText(todo.text);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    const due_date = date ? format(date, "yyyy-MM-dd") : null;
    await onUpdate(todo.id, { due_date });
  };

  const handleExpand = () => {
    if (!expanded && onFetchSubtasks) {
      onFetchSubtasks(todo.id);
    }
    setExpanded((e) => !e);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group/item rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {!isDragDisabled && (
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => {
            const currentIdx = priorityOrder.indexOf(todo.priority);
            const next = priorityOrder[(currentIdx + 1) % priorityOrder.length];
            onUpdate(todo.id, { priority: next });
          }}
          className="shrink-0 group/priority"
          title={`Priority: ${priorityConfig[todo.priority].label} — click to cycle`}
          aria-label={`Priority: ${priorityConfig[todo.priority].label}`}
        >
          <span className={cn("block h-2.5 w-2.5 rounded-full transition-colors", priorityConfig[todo.priority].dot)} />
        </button>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4 accent-primary cursor-pointer"
        />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={editText}
              maxLength={250}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={saveText}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveText();
                if (e.key === "Escape") { setEditText(todo.text); setEditing(false); }
              }}
              className="flex-1 text-xs bg-transparent border-b border-primary/50 text-foreground outline-none py-0.5"
            />
          ) : (
            <span
              onClick={() => !todo.done && setEditing(true)}
              className={cn(
                "text-xs truncate",
                todo.done
                  ? "line-through text-muted-foreground opacity-50"
                  : "text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              )}
              title={todo.done ? undefined : "Click to edit"}
            >
              {todo.text}
            </span>
          )}
          {todo.category && !editing && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                categoryColors[todo.category] || categoryColors.Other
              }`}
            >
              {todo.category}
            </span>
          )}
          {!editing && (
            <Popover>
              <PopoverTrigger asChild>
                {todo.recurrence ? (
                  <button
                    className="shrink-0 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-accent text-accent-foreground hover:opacity-80 transition-opacity cursor-pointer"
                    title={`Repeats ${todo.recurrence} — click to change`}
                  >
                    <Repeat className="h-2.5 w-2.5" />
                    {todo.recurrence.charAt(0).toUpperCase()}
                  </button>
                ) : (
                  <button
                    className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors opacity-0 group-hover/item:opacity-100"
                    aria-label="Add recurrence"
                  >
                    <Repeat className="h-3 w-3" />
                  </button>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-medium text-muted-foreground px-1 pb-1">Repeat</p>
                  {(["daily", "weekly", "monthly"] as Recurrence[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => onUpdate(todo.id, { recurrence: r })}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-md text-left transition-colors",
                        todo.recurrence === r
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                  {todo.recurrence && (
                    <button
                      onClick={() => onUpdate(todo.id, { recurrence: null })}
                      className="text-xs px-3 py-1.5 rounded-md text-left text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {!editing && (
            <Popover>
              <PopoverTrigger asChild>
                {dueInfo ? (
                  <button
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${dueInfo.className}`}
                    aria-label="Edit due date"
                  >
                    {dueInfo.label}
                  </button>
                ) : (
                  <button
                    className="shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors opacity-0 group-hover/item:opacity-100"
                    aria-label="Add due date"
                  >
                    <CalendarIcon className="h-3 w-3" />
                  </button>
                )}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={todo.due_date ? parseISO(todo.due_date) : undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                {todo.due_date && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => onUpdate(todo.id, { due_date: null })}
                      className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove due date
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
        </div>
        <button
          onClick={handleExpand}
          className={cn(
            "text-muted-foreground/40 hover:text-muted-foreground transition-all",
            expanded ? "rotate-180 text-muted-foreground" : "opacity-0 group-hover/item:opacity-100"
          )}
          aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-muted-foreground hover:text-destructive transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
      {expanded && onAddSubtask && onToggleSubtask && onDeleteSubtask && (
        <SubtaskList
          todoId={todo.id}
          subtasks={subtasks || []}
          onAdd={onAddSubtask}
          onToggle={onToggleSubtask}
          onDelete={onDeleteSubtask}
        />
      )}
    </li>
  );
});

SortableTodoItem.displayName = "SortableTodoItem";
export default SortableTodoItem;
