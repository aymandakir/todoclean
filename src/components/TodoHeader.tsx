import { memo } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Logo from "@/components/Logo";

interface TodoHeaderProps {
  displayName: string | null;
  avatarUrl: string | null;
  dark: boolean;
  onToggleDark: () => void;
}

const TodoHeader = memo(({ displayName, avatarUrl, dark, onToggleDark }: TodoHeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  return (
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/profile")} aria-label="Go to profile">
          <Avatar className="h-10 w-10 border border-border cursor-pointer hover:ring-2 hover:ring-ring transition-all">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="Your avatar" /> : null}
            <AvatarFallback className="text-sm font-semibold">
              {displayName?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </button>
        <div>
          <Logo className="text-4xl leading-none" />
          {displayName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {greeting}, {displayName}
            </p>
          )}
        </div>
      </div>
      <nav className="flex gap-2" aria-label="App controls">
        <button
          onClick={onToggleDark}
          className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </nav>
    </header>
  );
});

TodoHeader.displayName = "TodoHeader";
export default TodoHeader;
