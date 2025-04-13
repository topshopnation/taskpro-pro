
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskItemPriority } from "./TaskItemPriority";
import { TaskItemDueDate } from "./TaskItemDueDate";
import { TaskItemProject } from "./TaskItemProject";
import { TaskItemActions } from "./TaskItemActions";
import { Task } from "./TaskItem";

interface TaskItemActionContainerProps {
  task: Task;
  onDeleteClick: () => void;
  onEditClick: () => void;
  isUpdating: boolean;
  onPriorityChange: (priority: 1 | 2 | 3 | 4) => void;
  onDateChange: (date: Date | undefined) => void;
  onProjectChange?: (projectId: string | null) => Promise<void>;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
}

export function TaskItemActionContainer({
  task,
  onDeleteClick,
  onEditClick,
  isUpdating,
  onPriorityChange,
  onDateChange,
  onProjectChange,
  onFavoriteToggle
}: TaskItemActionContainerProps) {
  return (
    <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
      <TooltipProvider>
        <div className="flex items-center space-x-1">
          {/* Order: Date, Project, Priority, Actions */}
          <TaskItemDueDate
            dueDate={task.dueDate}
            onDateChange={onDateChange}
            isUpdating={isUpdating}
          />
          
          {onProjectChange && (
            <TaskItemProject
              taskId={task.id}
              projectId={task.projectId}
              isUpdating={isUpdating}
              onProjectChange={onProjectChange}
            />
          )}
          
          <TaskItemPriority 
            priority={task.priority} 
            onPriorityChange={onPriorityChange}
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
