
import { useState, useCallback, useEffect } from "react";
import { Task } from "@/components/tasks/taskTypes";

export function useOptimisticTasks(initialTasks: Task[] = []) {
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());

  // Ensure initialTasks is always an array to prevent map errors
  const safeTasks = Array.isArray(initialTasks) ? initialTasks : [];

  // Filter out hidden tasks for optimistic UI updates
  const visibleTasks = safeTasks.filter(task => !hiddenTaskIds.has(task.id));

  const handleOptimisticComplete = useCallback((taskId: string, completed: boolean) => {
    console.log('handleOptimisticComplete called:', { taskId, completed });
    
    if (completed) {
      // Hide task immediately when marked as complete
      setHiddenTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.add(taskId);
        console.log('Hiding task:', taskId, 'New hidden set size:', newSet.size);
        return newSet;
      });
    } else {
      // Show task immediately when marked as incomplete (undo)
      setHiddenTaskIds(prev => {
        const newSet = new Set(prev);
        const wasHidden = newSet.delete(taskId);
        console.log('Restoring task:', taskId, 'Was hidden:', wasHidden, 'New hidden set size:', newSet.size);
        return newSet;
      });
    }
  }, []);

  const handleOptimisticDelete = useCallback((taskId: string) => {
    console.log('handleOptimisticDelete called:', taskId);
    // Hide task immediately when deleted
    setHiddenTaskIds(prev => new Set(prev).add(taskId));
  }, []);

  const handleOptimisticRestore = useCallback((taskId: string) => {
    console.log('handleOptimisticRestore called:', taskId);
    // Show task immediately when restored
    setHiddenTaskIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
  }, []);

  const resetOptimisticState = useCallback(() => {
    console.log('resetOptimisticState called');
    setHiddenTaskIds(new Set());
  }, []);

  // Reset hidden tasks when the initial tasks list changes (e.g., due to query refetch)
  useEffect(() => {
    console.log('Initial tasks changed, resetting optimistic state. Tasks count:', safeTasks.length);
    // Only reset if we have tasks to avoid clearing state prematurely
    if (safeTasks.length > 0) {
      setHiddenTaskIds(new Set());
    }
  }, [safeTasks]);

  return {
    visibleTasks,
    handleOptimisticComplete,
    handleOptimisticDelete,
    handleOptimisticRestore,
    resetOptimisticState
  };
}
