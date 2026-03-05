import { Search, X } from "lucide-react";
import { useRef } from "react";

interface TodoSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const TodoSearch = ({ value, onChange }: TodoSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search tasks…"
        className="w-full rounded-lg border border-border bg-card pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default TodoSearch;
