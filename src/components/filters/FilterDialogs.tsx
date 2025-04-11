
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { EditFilterDialog } from "./edit-filter/EditFilterDialog";
import { DeleteFilterDialog } from "./edit-filter/DeleteFilterDialog";

interface FilterDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  filterName: string;
  filterColor?: string;
  filterConditions?: any;
  isUpdating?: boolean;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onFilterNameChange: (name: string) => void;
  onFilterColorChange?: (color: string) => void;
  onFilterConditionsChange?: (conditions: any) => void;
  onRename: () => void;
  onDelete: () => void;
}

export function FilterDialogs({
  isEditDialogOpen,
  isDeleteDialogOpen,
  filterName,
  filterColor = "",
  filterConditions = { items: [], logic: "and" },
  isUpdating = false,
  onEditDialogChange,
  onDeleteDialogChange,
  onFilterNameChange,
  onFilterColorChange,
  onFilterConditionsChange,
  onRename,
  onDelete,
}: FilterDialogsProps) {
  return (
    <>
      <EditFilterDialog 
        open={isEditDialogOpen}
        onOpenChange={onEditDialogChange}
        filterName={filterName}
        filterColor={filterColor}
        filterConditions={filterConditions}
        onFilterNameChange={onFilterNameChange}
        onFilterColorChange={onFilterColorChange || (() => {})}
        onFilterConditionsChange={onFilterConditionsChange || (() => {})}
        onSave={onRename}
        isUpdating={isUpdating}
      />

      <DeleteFilterDialog 
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogChange}
        onDelete={onDelete}
        isUpdating={isUpdating}
      />
    </>
  );
}
