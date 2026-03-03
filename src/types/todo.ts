export type Priority = "low" | "medium" | "high";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  position: number;
  category?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  priority: Priority;
}
