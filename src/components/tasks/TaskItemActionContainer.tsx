
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TaskItemPriority } from "./TaskItemPriority";
import { TaskItemDueDate } from "./TaskItemDueDate";
import { TaskItemProject } from "./TaskItemProject";
import { TaskItemActions } from "./TaskItemActions";
import { Task } from "./TaskItem";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

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
  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  return (
    <div className="flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
      {/* Left side: Date and Project badges */}
      <div className="flex items-center gap-1 flex-wrap">
        {task.dueDate && (
          <Badge variant="outline" className="text-xs px-1 py-0.5 whitespace-nowrap text-[10px] sm:text-xs">
            {formatDueDate(task.dueDate)}
            {task.dueTime && ` ${task.dueTime}`}
          </Badge>
        )}
        
        {task.projectName && task.projectName !== "No Project" && (
          <Badge variant="secondary" className="text-xs px-1 py-0.5 whitespace-nowrap text-[10px] sm:text-xs">
            {task.projectName}
          </Badge>
        )}
      </div>

      {/* Right side: Action icons */}
      <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
        <TooltipProvider>
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
        </TooltipProvider>
      </div>
    </div>
  );
}
