
import { Task } from "@/components/tasks/taskTypes";
import { Filter } from "@/types/supabase";

export function applyFilter(tasks: Task[], filter: Filter): Task[] {
  if (!filter.conditions || filter.conditions.length === 0) {
    return tasks;
  }

  return tasks.filter(task => {
    const conditionResults = filter.conditions.map((condition: any) => {
      switch (condition.type) {
        case 'priority':
          return task.priority.toString() === condition.value;
        case 'project':
          return task.projectId === condition.value;
        case 'due':
          if (condition.value === 'today') {
            const today = new Date();
            return task.dueDate && 
              task.dueDate.toDateString() === today.toDateString();
          }
          if (condition.value === 'this_week') {
            const today = new Date();
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return task.dueDate && 
              task.dueDate >= today && 
              task.dueDate <= weekFromNow;
          }
          return false;
        case 'completed':
          return task.completed === (condition.value === 'true');
        case 'favorite':
          return task.favorite === (condition.value === 'true');
        default:
          return true;
      }
    });

    // Apply logic (AND/OR)
    if (filter.logic === 'and') {
      return conditionResults.every(result => result);
    } else {
      return conditionResults.some(result => result);
    }
  });
}
