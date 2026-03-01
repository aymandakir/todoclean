import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutsOptions {
  onFocusInput: () => void;
  onToggleDark: () => void;
  onFilterChange: (filter: "all" | "active" | "completed") => void;
  onShowHelp: () => void;
}

export function useKeyboardShortcuts({
  onFocusInput,
  onToggleDark,
  onFilterChange,
  onShowHelp,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Skip if modifier keys are held (allow browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          onFocusInput();
          break;
        case "d":
          e.preventDefault();
          onToggleDark();
          break;
        case "1":
          e.preventDefault();
          onFilterChange("all");
          break;
        case "2":
          e.preventDefault();
          onFilterChange("active");
          break;
        case "3":
          e.preventDefault();
          onFilterChange("completed");
          break;
        case "?":
          e.preventDefault();
          onShowHelp();
          break;
      }
    },
    [onFocusInput, onToggleDark, onFilterChange, onShowHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
