
import { Task } from "@/components/tasks/taskTypes";
import { isToday, isTomorrow, isYesterday, format } from "date-fns";

export const formatOverdueDate = (date: Date) => {
  if (isYesterday(date)) return "Yesterday";
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d, yyyy");
};

export const groupOverdueTasksByDate = (tasks: Task[]) => {
  const groups: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = formatOverdueDate(task.dueDate);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(task);
    }
  });
  
  return groups;
};

export const calculateOverdueDays = (dueDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
