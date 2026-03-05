
CREATE TABLE public.subtasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  todo_id uuid NOT NULL REFERENCES public.todos(id) ON DELETE CASCADE,
  text text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subtasks"
ON public.subtasks FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.todos WHERE todos.id = subtasks.todo_id AND todos.user_id = auth.uid())
);

CREATE POLICY "Users can insert own subtasks"
ON public.subtasks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.todos WHERE todos.id = subtasks.todo_id AND todos.user_id = auth.uid())
);

CREATE POLICY "Users can update own subtasks"
ON public.subtasks FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.todos WHERE todos.id = subtasks.todo_id AND todos.user_id = auth.uid())
);

CREATE POLICY "Users can delete own subtasks"
ON public.subtasks FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.todos WHERE todos.id = subtasks.todo_id AND todos.user_id = auth.uid())
);
