ALTER TABLE public.todos ADD COLUMN position integer NOT NULL DEFAULT 0;

-- Backfill existing todos with position based on created_at order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) - 1 AS pos
  FROM public.todos
)
UPDATE public.todos SET position = ranked.pos FROM ranked WHERE public.todos.id = ranked.id;