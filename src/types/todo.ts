export type Priority = "low" | "medium" | "high";
export type Recurrence = "daily" | "weekly" | "monthly";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  position: number;
  category?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  priority: Priority;
  recurrence?: Recurrence | null;
}
