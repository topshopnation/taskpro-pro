
import { Task } from "@/components/tasks/taskTypes";

export const sortTasksByPriority = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => a.priority - b.priority);
};

export const sortTasksByDueDate = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
};

export const sortTasksByTitle = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
};

export const sortTasksByCreated = (tasks: Task[]) => {
  return [...tasks].sort((a, b) => {
    // Since we don't have created_at in the Task interface, 
    // we'll maintain the original order
    return 0;
  });
};

export type SortOption = 'priority' | 'dueDate' | 'title' | 'created';

export const sortTasks = (tasks: Task[], sortBy: SortOption) => {
  switch (sortBy) {
    case 'priority':
      return sortTasksByPriority(tasks);
    case 'dueDate':
      return sortTasksByDueDate(tasks);
    case 'title':
      return sortTasksByTitle(tasks);
    case 'created':
      return sortTasksByCreated(tasks);
    default:
      return tasks;
  }
};
