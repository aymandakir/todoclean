import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Subtask {
  id: string;
  todo_id: string;
  text: string;
  done: boolean;
  position: number;
}

export function useSubtasks() {
  const [subtasksByTodo, setSubtasksByTodo] = useState<Record<string, Subtask[]>>({});
  const [loadingTodos, setLoadingTodos] = useState<Set<string>>(new Set());

  const fetchSubtasks = useCallback(async (todoId: string) => {
    setLoadingTodos((s) => new Set(s).add(todoId));
    const { data } = await supabase
      .from("subtasks")
      .select("id, todo_id, text, done, position")
      .eq("todo_id", todoId)
      .order("position", { ascending: true });

    if (data) {
      setSubtasksByTodo((prev) => ({ ...prev, [todoId]: data as unknown as Subtask[] }));
    }
    setLoadingTodos((s) => {
      const next = new Set(s);
      next.delete(todoId);
      return next;
    });
  }, []);

  const addSubtask = useCallback(async (todoId: string, text: string) => {
    const trimmed = text.trim().slice(0, 200);
    if (!trimmed) return;

    const existing = subtasksByTodo[todoId] || [];
    const position = existing.length;

    const { data, error } = await supabase
      .from("subtasks")
      .insert({ todo_id: todoId, text: trimmed, position } as any)
      .select("id, todo_id, text, done, position")
      .single();

    if (!error && data) {
      setSubtasksByTodo((prev) => ({
        ...prev,
        [todoId]: [...(prev[todoId] || []), data as unknown as Subtask],
      }));
    }
  }, [subtasksByTodo]);

  const toggleSubtask = useCallback(async (todoId: string, subtaskId: string) => {
    const list = subtasksByTodo[todoId];
    if (!list) return;
    const sub = list.find((s) => s.id === subtaskId);
    if (!sub) return;

    const newDone = !sub.done;
    const { error } = await supabase
      .from("subtasks")
      .update({ done: newDone } as any)
      .eq("id", subtaskId);

    if (!error) {
      setSubtasksByTodo((prev) => ({
        ...prev,
        [todoId]: prev[todoId].map((s) =>
          s.id === subtaskId ? { ...s, done: newDone } : s
        ),
      }));
    }
  }, [subtasksByTodo]);

  const deleteSubtask = useCallback(async (todoId: string, subtaskId: string) => {
    const { error } = await supabase.from("subtasks").delete().eq("id", subtaskId);
    if (!error) {
      setSubtasksByTodo((prev) => ({
        ...prev,
        [todoId]: (prev[todoId] || []).filter((s) => s.id !== subtaskId),
      }));
    }
  }, []);

  return {
    subtasksByTodo,
    loadingTodos,
    fetchSubtasks,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}
