import { memo, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TodoInputProps {
  onAdd: (text: string, dueDate?: Date) => Promise<boolean | undefined>;
}

export interface TodoInputHandle {
  focus: () => void;
}

const TodoInput = forwardRef<TodoInputHandle, TodoInputProps>(({ onAdd }, ref) => {
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleAdd = async () => {
    const text = input.trim();
    if (!text || text.length < 1) return;
    const success = await onAdd(text, dueDate);
    if (success) {
      setInput("");
      setDueDate(undefined);
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
      {dueDate && (
        <p className="text-xs text-muted-foreground mt-2">
          Due: {format(dueDate, "MMM d, yyyy")}
        </p>
      )}
    </div>
  );
});

TodoInput.displayName = "TodoInput";
export default TodoInput;
