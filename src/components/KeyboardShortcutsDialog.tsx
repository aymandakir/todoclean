import { memo, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const shortcuts = [
  { keys: ["N"], description: "Focus task input" },
  { keys: ["D"], description: "Toggle dark mode" },
  { keys: ["1"], description: "Show all tasks" },
  { keys: ["2"], description: "Show active tasks" },
  { keys: ["3"], description: "Show completed tasks" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

const KeyboardShortcutsDialog = memo(() => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors"
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 text-[11px] font-mono font-medium text-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
});

KeyboardShortcutsDialog.displayName = "KeyboardShortcutsDialog";
export default KeyboardShortcutsDialog;
