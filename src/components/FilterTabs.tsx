import { memo } from "react";

type Filter = "all" | "active" | "completed";

interface FilterTabsProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const FilterTabs = memo(({ filter, onFilterChange }: FilterTabsProps) => (
  <div className="flex gap-1 mb-4 rounded-lg border border-border bg-card p-1" role="tablist" aria-label="Filter tasks">
    {(["all", "active", "completed"] as const).map((f) => (
      <button
        key={f}
        role="tab"
        aria-selected={filter === f}
        onClick={() => onFilterChange(f)}
        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
          filter === f
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {f}
      </button>
    ))}
  </div>
));

FilterTabs.displayName = "FilterTabs";
export default FilterTabs;
