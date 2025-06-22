
import { Task } from "@/components/tasks/taskTypes";
import { isToday, isPast, format } from "date-fns";

export const filterTodayTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => 
    task.dueDate && isToday(task.dueDate) && !task.completed
  );
};

export const filterOverdueTasks = (tasks: Task[]): Task[] => {
  return tasks.filter(task => 
    task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed
  );
};

export const groupTasksByStatus = (tasks: Task[]) => {
  const todayTasks = filterTodayTasks(tasks);
  const overdueTasks = filterOverdueTasks(tasks);
  
  return {
    today: todayTasks,
    overdue: overdueTasks
  };
};

export const formatTaskTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // Only show time if it's not midnight (00:00)
  if (hours === 0 && minutes === 0) {
    return "";
  }
  
  return format(date, "h:mm a");
};

export const groupTasks = (
  tasks: Task[], 
  groupBy?: string | null, 
  sortBy?: string, 
  sortDirection?: "asc" | "desc"
) => {
  if (!groupBy) {
    return { "Today's Tasks": tasks };
  }
  
  return groupTasksByStatus(tasks);
};
