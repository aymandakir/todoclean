import { useState, useRef, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subtask } from "@/hooks/use-subtasks";

interface SubtaskListProps {
  todoId: string;
  subtasks: Subtask[];
  onAdd: (todoId: string, text: string) => Promise<void>;
  onToggle: (todoId: string, subtaskId: string) => Promise<void>;
  onDelete: (todoId: string, subtaskId: string) => Promise<void>;
}

const SubtaskList = ({ todoId, subtasks, onAdd, onToggle, onDelete }: SubtaskListProps) => {
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleAdd = async () => {
    if (!newText.trim()) {
      setAdding(false);
      return;
    }
    await onAdd(todoId, newText);
    setNewText("");
    inputRef.current?.focus();
  };

  const completed = subtasks.filter((s) => s.done).length;

  return (
    <div className="pl-9 pr-6 pb-2 space-y-1">
      {subtasks.length > 0 && (
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/60 rounded-full transition-all duration-300"
              style={{ width: `${subtasks.length ? (completed / subtasks.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {completed}/{subtasks.length}
          </span>
        </div>
      )}

      {subtasks.map((sub) => (
        <div key={sub.id} className="group/sub flex items-center gap-2 py-0.5">
          <button
            onClick={() => onToggle(todoId, sub.id)}
            className={cn(
              "h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
              sub.done
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 hover:border-primary/50"
            )}
          >
            {sub.done && <Check className="h-2.5 w-2.5" />}
          </button>
          <span
            className={cn(
              "text-[11px] flex-1 truncate",
              sub.done ? "line-through text-muted-foreground/50" : "text-muted-foreground"
            )}
          >
            {sub.text}
          </span>
          <button
            onClick={() => onDelete(todoId, sub.id)}
            className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover/sub:opacity-100"
            aria-label="Delete subtask"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-2 py-0.5">
          <div className="h-3.5 w-3.5 rounded border border-muted-foreground/20 shrink-0" />
          <input
            ref={inputRef}
            value={newText}
            maxLength={200}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") { setNewText(""); setAdding(false); }
            }}
            onBlur={handleAdd}
            placeholder="Add subtask…"
            className="flex-1 text-[11px] bg-transparent border-b border-primary/30 text-foreground outline-none py-0.5 placeholder:text-muted-foreground/40"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors py-0.5"
        >
          <Plus className="h-3 w-3" />
          Add subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
