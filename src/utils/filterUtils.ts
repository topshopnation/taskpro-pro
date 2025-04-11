
import { Task } from "@/components/tasks/TaskItem";
import { CustomFilter } from "@/types/filterTypes";

export const isStandardFilter = (filterId: string | undefined): boolean => {
  if (!filterId) return false;
  return ["today", "upcoming", "priority1"].includes(filterId);
};

export const filterTasks = (tasks: Task[], filter: CustomFilter | null): Task[] => {
  if (!filter) return tasks;
  
  // Handle different formats of conditions (array or object with items)
  let conditions = [];
  let logic = "and";
  
  if (Array.isArray(filter.conditions)) {
    conditions = filter.conditions;
    logic = filter.logic || "and";
  } else if (filter.conditions?.items) {
    conditions = filter.conditions.items;
    logic = filter.conditions.logic || filter.logic || "and";
  } else if (typeof filter.conditions === 'object' && filter.conditions !== null) {
    // Try to extract items in a safer way
    conditions = Array.isArray(filter.conditions.items) ? filter.conditions.items : [];
    logic = filter.conditions.logic || filter.logic || "and";
  }
  
  // Extra safety check
  if (!Array.isArray(conditions)) {
    console.warn("Invalid filter conditions format:", filter.conditions);
    return tasks;
  }
  
  if (conditions.length === 0) {
    return tasks;
  }
  
  console.log("Filtering with conditions:", conditions, "and logic:", logic);
  
  return tasks.filter(task => {
    const results = conditions.map((condition: any) => {
      console.log("Checking condition:", condition, "for task:", task.title);
      
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
      
      if (condition.type === "priority" && condition.value === "2") {
        return task.priority === 2;
      }
      
      if (condition.type === "priority" && condition.value === "3") {
        return task.priority === 3;
      }
      
      if (condition.type === "priority" && condition.value === "4") {
        return task.priority === 4;
      }
      
      if (condition.type === "project") {
        return task.projectId === condition.value;
      }
      
      return false;
    });
    
    // Apply the filter logic (AND/OR)
    if (logic === "and") {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  });
};
