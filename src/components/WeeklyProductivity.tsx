import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Todo } from "@/types/todo";

interface WeeklyProductivityProps {
  todos: Todo[];
}

const WeeklyProductivity = ({ todos }: WeeklyProductivityProps) => {
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
        date,
        label: format(date, "EEE"),
        completed: 0,
      };
    });

    todos.forEach((todo) => {
      if (todo.done && todo.completed_at) {
        const completedDay = startOfDay(new Date(todo.completed_at));
        const dayEntry = days.find(
          (d) => d.date.getTime() === completedDay.getTime()
        );
        if (dayEntry) dayEntry.completed += 1;
      }
    });

    return days.map(({ label, completed }) => ({ label, completed }));
  }, [todos]);

  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);

  if (totalCompleted === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          This Week — {totalCompleted} task{totalCompleted !== 1 ? "s" : ""} completed
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={24}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={24}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                cursor={{ className: "fill-muted/40" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--background))",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar
                dataKey="completed"
                name="Completed"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProductivity;
