
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskItemPriority } from "./TaskItemPriority";
import { TaskItemDueDate } from "./TaskItemDueDate";
import { TaskItemActions } from "./TaskItemActions";
import { Task } from "./TaskItem";

interface TaskItemActionContainerProps {
  task: Task;
  onDeleteClick: () => void;
  onEditClick: () => void;
  isUpdating: boolean;
  onPriorityChange: (priority: 1 | 2 | 3 | 4) => void;
  onDateChange: (date: Date | undefined) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
}

export function TaskItemActionContainer({
  task,
  onDeleteClick,
  onEditClick,
  isUpdating,
  onPriorityChange,
  onDateChange,
  onFavoriteToggle
}: TaskItemActionContainerProps) {
  return (
    <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
      <TooltipProvider>
        <div className="flex items-center space-x-1">
          <TaskItemPriority 
            priority={task.priority} 
            onPriorityChange={onPriorityChange}
            isUpdating={isUpdating}
          />
          
          <TaskItemDueDate
            dueDate={task.dueDate}
            onDateChange={onDateChange}
            isUpdating={isUpdating}
          />
          
          <TaskItemActions
            task={task}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
            isUpdating={isUpdating}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      </TooltipProvider>
    </div>
  );
}
