
import { Task } from "@/components/tasks/TaskItem";
import { CustomFilter } from "@/types/filterTypes";

export const isStandardFilter = (filterId: string | undefined): boolean => {
  if (!filterId) return false;
  return ["today", "upcoming", "priority1"].includes(filterId);
};

export const filterTasks = (tasks: Task[], filter: CustomFilter | null): Task[] => {
  if (!filter) return tasks;
  
  // Handle case where conditions could be an array or an object with items property
  const conditions = Array.isArray(filter.conditions) 
    ? filter.conditions 
    : filter.conditions?.items || [];
  
  if (conditions.length === 0) return tasks;
  
  return tasks.filter(task => {
    const results = conditions.map((condition: any) => {
      if (condition.type === "due" && condition.value === "today" && task.dueDate) {
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.getDate() === today.getDate() &&
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        );
      }
      
      if (condition.type === "due" && condition.value === "this_week" && task.dueDate) {
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        const dayDiff = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return dayDiff >= 0 && dayDiff <= 7;
      }
      
      if (condition.type === "priority" && condition.value === "1") {
        return task.priority === 1;
      }
      
      if (condition.type === "project") {
        return task.projectId === condition.value;
      }
      
      return false;
    });
    
    // Use the filter's logic if available, otherwise default to "and"
    const logic = Array.isArray(filter.conditions) 
      ? filter.logic 
      : filter.conditions?.logic || "and";
    
    if (logic === "and") {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  });
};
