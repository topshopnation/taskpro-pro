import { useState } from "react"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "./EditTaskDialog"
import { Task } from "@/components/tasks/taskTypes"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskItemActionsProps {
  task: Task;
  onDeleteClick: () => void;
  onEditClick: () => void;
  isUpdating: boolean;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
}

export function TaskItemActions({ task, onDeleteClick, onEditClick, isUpdating, onFavoriteToggle }: TaskItemActionsProps) {
  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">More options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={onDeleteClick}
            className="text-destructive focus:text-destructive"
            disabled={isUpdating}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
