import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "manual" | "priority" | "due_date" | "alphabetical";

interface TodoSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const options: { value: SortOption; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "priority", label: "Priority" },
  { value: "due_date", label: "Due date" },
  { value: "alphabetical", label: "A–Z" },
];

const TodoSort = ({ value, onChange }: TodoSortProps) => (
  <div className="flex items-center gap-1 shrink-0">
    <ArrowUpDown className="h-3 w-3 text-muted-foreground/60 shrink-0" />
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default TodoSort;
