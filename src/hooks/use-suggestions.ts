import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Todo } from "@/types/todo";

export function useSuggestions(todos: Todo[], addTodo: (text: string) => Promise<boolean | undefined>) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-tasks", {
        body: { todos: todos.map((t) => ({ text: t.text, done: t.done })) },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI error", description: data.error, variant: "destructive" });
      } else {
        setSuggestions((data?.suggestions || []).map((s: { title: string }) => s.title));
      }
    } catch (e: any) {
      toast({ title: "Failed to get suggestions", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  }, [todos, toast]);

  const addSuggestion = useCallback(async (text: string) => {
    await addTodo(text);
    setSuggestions((prev) => prev.filter((s) => s !== text));
  }, [addTodo]);

  const dismissSuggestion = useCallback((text: string) => {
    setSuggestions((prev) => prev.filter((s) => s !== text));
  }, []);

  return { suggestions, loading, fetchSuggestions, addSuggestion, dismissSuggestion };
}
