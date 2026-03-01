import { memo } from "react";
import { motion } from "framer-motion";

interface TodoProgressProps {
  total: number;
  completed: number;
}

const TodoProgress = memo(({ total, completed }: TodoProgressProps) => {
  if (total === 0) return null;

  const percent = Math.round((completed / total) * 100);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {completed}/{total} completed
        </span>
        <span className="text-xs font-semibold text-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
});

TodoProgress.displayName = "TodoProgress";
export default TodoProgress;
