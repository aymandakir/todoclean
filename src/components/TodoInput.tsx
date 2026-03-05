import { memo, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Priority, Recurrence } from "@/types/todo";
import { Repeat } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TodoInputProps {
  onAdd: (text: string, dueDate?: Date, priority?: Priority, recurrence?: Recurrence | null) => Promise<boolean | undefined>;
}

const priorityOptions: { value: Priority; dot: string; label: string }[] = [
  { value: "low", dot: "bg-emerald-400", label: "Low" },
  { value: "medium", dot: "bg-amber-400", label: "Med" },
  { value: "high", dot: "bg-red-400", label: "High" },
];

const recurrenceOptions: { value: Recurrence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export interface TodoInputHandle {
  focus: () => void;
}

const TodoInput = forwardRef<TodoInputHandle, TodoInputProps>(({ onAdd }, ref) => {
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>("medium");
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleAdd = async () => {
    const text = input.trim();
    if (!text || text.length < 1) return;
    const success = await onAdd(text, dueDate, priority, recurrence);
    if (success) {
      setInput("");
      setDueDate(undefined);
      setPriority("medium");
      setRecurrence(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            className={cn(
              "w-full rounded-lg border bg-card px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring border-border",
              input.length > 200 && "border-destructive focus:ring-destructive"
            )}
            placeholder="Add a task…"
            value={input}
            maxLength={250}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            aria-label="New task text"
          />
          {input.length > 150 && (
            <span
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-xs",
                input.length > 200 ? "text-destructive" : "text-muted-foreground"
              )}
              aria-live="polite"
            >
              {input.length}/200
            </span>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors",
                dueDate && "border-primary text-primary"
              )}
              aria-label="Set due date"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="p-3 pointer-events-auto"
            />
            {dueDate && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => setDueDate(undefined)}
                  className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear date
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Add
        </button>
      </div>
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        <div className="flex items-center gap-1">
          {priorityOptions.map((p) => (
            <button
              key={p.value}
              onClick={() => setPriority(p.value)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                priority === p.value
                  ? "bg-secondary text-foreground ring-1 ring-ring"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", p.dot)} />
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Repeat className="h-3 w-3 text-muted-foreground" />
          {recurrenceOptions.map((r) => (
            <button
              key={r.value}
              onClick={() => setRecurrence(recurrence === r.value ? null : r.value)}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-all",
                recurrence === r.value
                  ? "bg-accent text-accent-foreground ring-1 ring-ring"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        {dueDate && (
          <p className="text-xs text-muted-foreground">
            Due: {format(dueDate, "MMM d, yyyy")}
          </p>
        )}
      </div>
    </div>
  );
});

TodoInput.displayName = "TodoInput";
export default TodoInput;
