
import { Task } from "@/components/tasks/TaskItem";
import { CustomFilter } from "@/types/filterTypes";
import { format, addDays, startOfWeek, endOfWeek, addWeeks, isWithinInterval, isSameDay, parse, isValid } from "date-fns";

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
      
      // Determine if the condition should be inverted based on operator
      const isInverted = condition.operator === "not_equals";
      let matches = false;
      
      if (condition.type === "due") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!task.dueDate) {
          // Special case: if we're looking for tasks without due dates
          return condition.value === "no-date" ? true : false;
        }
        
        // Make sure task.dueDate is a Date object
        const taskDate = task.dueDate instanceof Date 
          ? task.dueDate 
          : new Date(task.dueDate);
        
        if (condition.value === "today") {
          matches = isSameDay(taskDate, today);
        } 
        else if (condition.value === "tomorrow") {
          const tomorrow = addDays(today, 1);
          matches = isSameDay(taskDate, tomorrow);
        }
        else if (condition.value === "this_week") {
          const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
          const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
          matches = isWithinInterval(taskDate, { start: startOfThisWeek, end: endOfThisWeek });
        }
        else if (condition.value === "next_week") {
          const nextWeekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1);
          const nextWeekEnd = addWeeks(endOfWeek(today, { weekStartsOn: 1 }), 1);
          matches = isWithinInterval(taskDate, { start: nextWeekStart, end: nextWeekEnd });
        }
        else if (condition.value.includes('-')) {
          // Handle custom date in format yyyy-MM-dd
          try {
            const customDate = parse(condition.value, 'yyyy-MM-dd', new Date());
            if (isValid(customDate)) {
              matches = isSameDay(taskDate, customDate);
            }
          } catch (error) {
            console.error("Error parsing custom date:", error);
          }
        }
      }
      else if (condition.type === "priority") {
        const priorityValue = parseInt(condition.value, 10);
        matches = task.priority === priorityValue;
      }
      else if (condition.type === "project") {
        if (condition.value === "inbox") {
          matches = !task.projectId || task.projectId === null;
        } else {
          matches = task.projectId === condition.value;
        }
      }
      
      // Return the result, applying the operator logic (equals or not_equals)
      return isInverted ? !matches : matches;
    });
    
    // Apply the filter logic (AND/OR)
    if (logic.toLowerCase() === "and") {
      return results.every(Boolean);
    } else {
      return results.some(Boolean);
    }
  });
};
