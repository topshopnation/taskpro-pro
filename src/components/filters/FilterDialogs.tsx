
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FilterDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  filterName: string;
  isUpdating?: boolean;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onFilterNameChange: (name: string) => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FilterDialogs({
  isEditDialogOpen,
  isDeleteDialogOpen,
  filterName,
  isUpdating = false,
  onEditDialogChange,
  onDeleteDialogChange,
  onFilterNameChange,
  onRename,
  onDelete,
}: FilterDialogsProps) {
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Filter</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => onFilterNameChange(e.target.value)}
                placeholder="Enter filter name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onEditDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={onRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this filter. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isUpdating}>
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
