
import { Task } from "@/components/tasks/taskTypes";
import { useTaskItemState } from "./useTaskItemState";
import { useTaskItemOperations } from "./useTaskItemOperations";

interface UseTaskItemProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
}

export function useTaskItem({
  task,
  onComplete,
  onDelete,
  onFavoriteToggle,
  onPriorityChange,
  onDateChange,
}: UseTaskItemProps) {
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isUpdating,
    setIsUpdating
  } = useTaskItemState();

  const {
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  } = useTaskItemOperations({
    task,
    onComplete,
    onDelete,
    onFavoriteToggle,
    onPriorityChange,
    onDateChange,
    setIsUpdating,
    isUpdating
  });

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isUpdating,
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  };
}
