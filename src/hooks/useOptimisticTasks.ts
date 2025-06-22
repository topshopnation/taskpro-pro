
import { useState, useCallback } from "react";
import { Task } from "@/components/tasks/taskTypes";

export function useOptimisticTasks(initialTasks: Task[] = []) {
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

  // Ensure initialTasks is always an array to prevent map errors
  const safeTasks = Array.isArray(initialTasks) ? initialTasks : [];

  // Filter out hidden tasks for optimistic UI updates
  const visibleTasks = safeTasks.filter(task => !hiddenTaskIds.has(task.id));

  const handleOptimisticComplete = useCallback((taskId: string, completed: boolean) => {
    if (completed) {
      // Hide task immediately when marked as complete
      setHiddenTaskIds(prev => new Set(prev).add(taskId));
    } else {
      // Show task immediately when marked as incomplete (undo)
      setHiddenTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }, []);

  const handleOptimisticDelete = useCallback((taskId: string) => {
    // Hide task immediately when deleted
    setHiddenTaskIds(prev => new Set(prev).add(taskId));
  }, []);

  const handleOptimisticRestore = useCallback((taskId: string) => {
    // Show task immediately when restored
    setHiddenTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);

  const resetOptimisticState = useCallback(() => {
    setHiddenTaskIds(new Set());
  }, []);

  return {
    visibleTasks,
    handleOptimisticComplete,
    handleOptimisticDelete,
    handleOptimisticRestore,
    resetOptimisticState
  };
}
