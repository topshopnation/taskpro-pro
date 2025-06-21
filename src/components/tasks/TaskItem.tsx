
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { TaskItemDetails } from "./TaskItemDetails";
import { TaskItemConfirmDelete } from "./TaskItemConfirmDelete";
import { useTaskData } from "./hooks/useTaskData";
import { EditTaskDialog } from "./EditTaskDialog";
import { useTaskItem } from "./hooks/useTaskItem";
import { TaskItemActionContainer } from "./TaskItemActionContainer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: Date;
  dueTime?: string;
  priority: 1 | 2 | 3 | 4;
  projectId: string;
  projectName?: string;
  projectColor?: string;
  completed: boolean;
  favorite?: boolean;
}

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
  onTaskEdit?: (task: Task) => void;
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  onProjectChange?: (taskId: string, projectId: string | null) => void;
}

export function TaskItem({ 
  task, 
  onComplete, 
  onDelete, 
  onFavoriteToggle,
  onTaskEdit,
  onPriorityChange,
  onDateChange,
  onProjectChange
}: TaskItemProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { taskTags, projectName } = useTaskData(task.id, task.projectId);
  
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleCompletionToggle,
    handlePriorityChange,
    handleDateChange,
    handleDelete
  } = useTaskItem({
    task,
    onComplete,
    onDelete,
    onFavoriteToggle,
    onPriorityChange,
    onDateChange
  });

  const handleTaskClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || 
       e.target.closest('input[type="checkbox"]') ||
       e.target.getAttribute('role') === 'checkbox')
    ) {
      return;
    }
    
    if (onTaskEdit) {
      onTaskEdit(task);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  const handleProjectChange = async (projectId: string | null): Promise<void> => {
    try {
      setIsUpdating(true);
      
      // Call the parent component's handler if provided
      if (onProjectChange) {
        onProjectChange(task.id, projectId);
      } else {
        // Otherwise, perform the update directly
        const { error } = await supabase
          .from('tasks')
          .update({ project_id: projectId })
          .eq('id', task.id);
        
        if (error) throw error;
        
        toast.success(projectId ? "Task moved to project" : "Task moved to inbox");
      }
    } catch (error: any) {
      toast.error(`Error changing project: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "flex flex-col gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
          `task-priority-${task.priority}`
        )}
        onClick={handleTaskClick}
      >
        {/* Top row: Checkbox and task details */}
        <div className="flex items-start gap-3">
          <div className="mt-1" onClick={e => e.stopPropagation()}>
            <Checkbox 
              checked={task.completed} 
              onCheckedChange={handleCompletionToggle}
              disabled={isUpdating}
            />
          </div>
          
          <TaskItemDetails
            title={task.title}
            notes={task.notes}
            dueDate={task.dueDate}
            dueTime={task.dueTime}
            completed={task.completed}
            tags={taskTags}
            projectName={projectName}
          />
        </div>
        
        {/* Bottom row: All actions in one line */}
        <div className="pl-8">
          <TaskItemActionContainer
            task={task}
            onDeleteClick={() => setIsDeleteDialogOpen(true)}
            onEditClick={() => onTaskEdit ? onTaskEdit(task) : setIsEditDialogOpen(true)}
            isUpdating={isUpdating}
            onPriorityChange={handlePriorityChange}
            onDateChange={handleDateChange}
            onProjectChange={handleProjectChange}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      </div>

      <TaskItemConfirmDelete 
        taskId={task.id}
        taskTitle={task.title}
        taskCompleted={task.completed}
        onDelete={async (id) => {
          await onDelete(id);
          return true;
        }}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        isUpdating={isUpdating}
      />

      {!onTaskEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={task}
        />
      )}
    </>
  );
}
