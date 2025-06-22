
import { useTaskCompletion } from "@/hooks/taskOperations/useTaskCompletion";
import { useTaskDeletion } from "@/hooks/taskOperations/useTaskDeletion";

export function useTaskOperations() {
  const { isLoading: isCompletionLoading, completeTask } = useTaskCompletion();
  const { isLoading: isDeletionLoading, deleteTask } = useTaskDeletion();
  
  // Return combined loading state and operations
  return {
    isLoading: isCompletionLoading || isDeletionLoading,
    completeTask,
    deleteTask
  };
}
