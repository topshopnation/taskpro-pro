
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
import { IconPicker } from "@/components/ui/color-picker";

interface FilterDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  filterName: string;
  filterColor?: string;
  isUpdating?: boolean;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onFilterNameChange: (name: string) => void;
  onFilterColorChange?: (color: string) => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FilterDialogs({
  isEditDialogOpen,
  isDeleteDialogOpen,
  filterName,
  filterColor = "",
  isUpdating = false,
  onEditDialogChange,
  onDeleteDialogChange,
  onFilterNameChange,
  onFilterColorChange,
  onRename,
  onDelete,
}: FilterDialogsProps) {
  const filterColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Filter</DialogTitle>
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
            
            {onFilterColorChange && (
              <div>
                <p className="text-sm font-medium mb-2">Filter Color</p>
                <IconPicker 
                  colors={filterColors} 
                  onChange={onFilterColorChange} 
                  selectedColor={filterColor} 
                />
              </div>
            )}
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
