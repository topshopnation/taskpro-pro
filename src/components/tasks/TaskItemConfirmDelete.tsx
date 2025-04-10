
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { TaskDeleteAlert } from "./TaskDeleteAlert";

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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this task. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <TaskDeleteAlert
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
            onUndo={() => onOpenChange(false)} 
            isUpdating={isUpdating}
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
