
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTaskOperations } from "@/hooks/useTaskOperations";

interface TaskItemConfirmDeleteProps {
  taskId: string;
  taskTitle: string;
  taskCompleted: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (taskId: string) => Promise<boolean>;
  open?: boolean;
  onConfirm?: () => Promise<void>;
  isUpdating?: boolean;
}

export function TaskItemConfirmDelete({
  taskId,
  taskTitle,
  taskCompleted,
  onOpenChange,
  onDelete,
  open,
  isUpdating: externalIsUpdating,
  onConfirm,
}: TaskItemConfirmDeleteProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { completeTask } = useTaskOperations();
  
  // Use the external isUpdating prop if provided, otherwise use the internal state
  const isCurrentlyDeleting = externalIsUpdating !== undefined ? externalIsUpdating : isDeleting;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // If onConfirm is provided, use it, otherwise use onDelete
      if (onConfirm) {
        await onConfirm();
      } else {
        await onDelete(taskId);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setIsDeleting(true);
      
      // First mark the task as complete
      const success = await completeTask(taskId, true);
      
      if (success) {
        // Then close the dialog
        onOpenChange(false);
        
        // Toast is now handled in completeTask function
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    } finally {
      setIsDeleting(false);
    }
  };

  // Changed to return a Promise
  const handleUndo = async (): Promise<void> => {
    try {
      await completeTask(taskId, false);
    } catch (error) {
      console.error("Error undoing task completion:", error);
      toast.error("Failed to undo task completion");
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{taskTitle}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <AlertDialogCancel className="w-full sm:w-auto" asChild>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </AlertDialogCancel>
            
            {!taskCompleted && (
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleMarkComplete}
                disabled={isCurrentlyDeleting}
              >
                {isCurrentlyDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Mark Complete
              </Button>
            )}
          </div>
          
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDelete}
              disabled={isCurrentlyDeleting}
            >
              {isCurrentlyDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
