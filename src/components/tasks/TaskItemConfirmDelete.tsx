import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { TaskDeleteAlert } from "./TaskDeleteAlert";
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface TaskItemConfirmDeleteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isUpdating: boolean
}

export function TaskItemConfirmDelete({ 
  open, 
  onOpenChange, 
  onConfirm, 
  isUpdating 
}: TaskItemConfirmDeleteProps) {
  const [showUndo, setShowUndo] = useState(false);
  const [progress, setProgress] = useState(0);
  const UNDO_TIMEOUT = 3000; // 3 seconds
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    
    if (showUndo) {
      // Set up interval to update progress bar
      let elapsed = 0;
      interval = setInterval(() => {
        elapsed += 50;
        setProgress(Math.min((elapsed / UNDO_TIMEOUT) * 100, 100));
        
        if (elapsed >= UNDO_TIMEOUT) {
          clearInterval(interval);
        }
      }, 50);
      
      // Set timeout to execute confirmation after delay
      timer = setTimeout(() => {
        onConfirm();
        setShowUndo(false);
        onOpenChange(false);
      }, UNDO_TIMEOUT);
    }
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [showUndo, onConfirm, onOpenChange]);
  
  const handleInitialConfirm = () => {
    setShowUndo(true);
  };
  
  const handleUndo = () => {
    setShowUndo(false);
    onOpenChange(false);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, UNDO_TIMEOUT);
    });
  };
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {!showUndo ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this task. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <TaskDeleteAlert
                onCancel={() => onOpenChange(false)}
                onConfirm={handleInitialConfirm}
                onUndo={handleUndo}
                isUpdating={isUpdating}
              />
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Task will be deleted</AlertDialogTitle>
              <AlertDialogDescription>
                You have 3 seconds to undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Progress value={progress} className="h-2" />
            </div>
            <AlertDialogFooter>
              <Button onClick={handleUndo} disabled={isUpdating}>
                Undo
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
