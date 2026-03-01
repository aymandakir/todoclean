import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Todo } from "@/types/todo";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("id, text, done, position, category, due_date, completed_at")
      .order("position", { ascending: true });

    if (error) {
      toast({ title: "Error loading todos", description: error.message, variant: "destructive" });
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }, [toast]);

  const addTodo = useCallback(async (text: string, dueDate?: Date) => {
    const taskText = text.slice(0, 200);
    if (!taskText) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPosition = todos.length;
    const { data, error } = await supabase
      .from("todos")
      .insert({
        text: taskText,
        user_id: user.id,
        position: newPosition,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      } as any)
      .select("id, text, done, position, category, due_date, completed_at")
      .single();

    if (error) {
      toast({ title: "Error adding todo", description: error.message, variant: "destructive" });
      return false;
    }

    if (data) {
      setTodos((prev) => [...prev, data]);

      // Auto-categorize in background
      supabase.functions
        .invoke("categorize-task", { body: { text: taskText } })
        .then(({ data: catData }) => {
          if (catData?.category && data.id) {
            supabase
              .from("todos")
              .update({ category: catData.category } as any)
              .eq("id", data.id)
              .then(() => {
                setTodos((prev) =>
                  prev.map((t) =>
                    t.id === data.id ? { ...t, category: catData.category } : t
                  )
                );
              });
          }
        });
      return true;
    }
    return false;
  }, [todos.length, toast]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newDone = !todo.done;
    const completed_at = newDone ? new Date().toISOString() : null;
    const { error } = await supabase
      .from("todos")
      .update({ done: newDone, completed_at } as any)
      .eq("id", id);

    if (!error) {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: newDone, completed_at } : t)));
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: { text?: string; due_date?: string | null }) => {
    const { error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating todo", description: error.message, variant: "destructive" });
      return false;
    }
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    return true;
  }, [toast]);

  const clearCompleted = useCallback(async () => {
    const completedIds = todos.filter((t) => t.done).map((t) => t.id);
    const { error } = await supabase.from("todos").delete().in("id", completedIds);
    if (!error) {
      setTodos((prev) => prev.filter((t) => !t.done));
    }
  }, [todos]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex).map((t, i) => ({ ...t, position: i }));
    setTodos(reordered);

    const updates = reordered.map((t) =>
      supabase.from("todos").update({ position: t.position }).eq("id", t.id)
    );
    await Promise.all(updates);
  }, [todos]);

  return {
    todos,
    loading,
    fetchTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearCompleted,
    handleDragEnd,
  };
}
