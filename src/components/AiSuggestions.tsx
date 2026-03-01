import { memo } from "react";
import { Sparkles, Plus, X, Loader2 } from "lucide-react";

interface AiSuggestionsProps {
  suggestions: string[];
  loading: boolean;
  onFetch: () => void;
  onAdd: (text: string) => void;
  onDismiss: (text: string) => void;
}

const AiSuggestions = memo(({ suggestions, loading, onFetch, onAdd, onDismiss }: AiSuggestionsProps) => (
  <>
    <button
      onClick={onFetch}
      disabled={loading}
      className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/80 transition-colors"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Thinking…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-primary" />
          Suggest tasks with AI
        </>
      )}
    </button>

    {suggestions.length > 0 && (
      <div className="mt-3 space-y-2" role="list" aria-label="AI task suggestions">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Suggestions
        </p>
        {suggestions.map((s) => (
          <div
            key={s}
            role="listitem"
            className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-accent/50 px-4 py-2.5"
          >
            <span className="flex-1 text-xs text-foreground">{s}</span>
            <button
              onClick={() => onAdd(s)}
              className="rounded-md bg-primary p-1 text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label={`Add suggestion: ${s}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDismiss(s)}
              className="rounded-md border border-border p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Dismiss suggestion: ${s}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    )}
  </>
));

AiSuggestions.displayName = "AiSuggestions";
export default AiSuggestions;
