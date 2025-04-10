
import React, { useState, useEffect } from "react";
import { AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Undo2 } from "lucide-react";

interface TaskDeleteAlertProps {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  onUndo: () => void;
  isUpdating: boolean;
}

export function TaskDeleteAlert({ 
  onCancel, 
  onConfirm, 
  onUndo,
  isUpdating 
}: TaskDeleteAlertProps) {
  const [progress, setProgress] = useState(100);
  const [undoVisible, setUndoVisible] = useState(false);
  const undoTimeoutMs = 3000; // 3 seconds for undo
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + undoTimeoutMs;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / undoTimeoutMs) * 100;
      
      setProgress(newProgress);
      
      if (newProgress > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        // When progress reaches 0, execute the confirm action
        handleConfirm();
      }
    };
    
    // Set undo visible for the UI
    setUndoVisible(true);
    
    // Start progress countdown
    const animationId = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  const handleConfirm = async () => {
    if (!isUpdating) {
      setUndoVisible(false);
      await onConfirm();
    }
  };
  
  const handleUndo = () => {
    setUndoVisible(false);
    onUndo();
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {undoVisible && (
        <>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleUndo}
              className="flex items-center gap-1"
              disabled={isUpdating}
            >
              <Undo2 className="h-4 w-4" />
              <span>Undo</span>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={isUpdating}
            >
              {isUpdating ? "Deleting..." : "Delete Now"}
            </Button>
          </div>
        </>
      )}
      
      {!undoVisible && (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
            disabled={isUpdating}
          >
            {isUpdating ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </div>
      )}
    </div>
  );
}
