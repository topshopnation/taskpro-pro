
import { Task } from "@/components/tasks/taskTypes";
import { format, subDays } from "date-fns";

export const filterCompletedTasksByTime = (tasks: Task[], timeFilter: string = "all"): Task[] => {
  return tasks.filter(task => {
    if (!task.completed) return false;
    
    // Apply time filter if needed
    if (timeFilter === "today") {
      if (!task.dueDate) return false;
      const today = new Date();
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    }
    
    if (timeFilter === "week") {
      if (!task.dueDate) return false;
      const weekAgo = subDays(new Date(), 7);
      return new Date(task.dueDate) >= weekAgo;
    }
    
    return true; // "all" filter
  });
};

export const groupTasksByProject = (tasks: Task[]): Record<string, Task[]> => {
  const tasksByProject: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    const projectId = task.projectId || "none";
    if (!tasksByProject[projectId]) {
      tasksByProject[projectId] = [];
    }
    tasksByProject[projectId].push(task);
  });
  
  return tasksByProject;
};
