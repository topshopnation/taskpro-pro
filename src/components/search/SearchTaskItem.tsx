
import { Task } from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { format } from "date-fns";
import { useState } from "react";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { Edit } from "lucide-react";

interface SearchTaskItemProps {
  task: Task;
  onOpenChange: (open: boolean) => void;
}

export function SearchTaskItem({ task, onOpenChange }: SearchTaskItemProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { completeTask } = useTaskOperations();
  
  const handleComplete = async (completed: boolean) => {
    await completeTask(task.id, completed);
  };
  
  const handleEdit = () => {
    setIsEditDialogOpen(true);
    onOpenChange(false);
  };
  
  return (
    <>
      <div 
        className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-accent cursor-pointer"
        onClick={handleEdit}
      >
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={task.completed} 
            onCheckedChange={handleComplete}
          />
          <div className="flex flex-col">
            <div>{task.title}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              {task.projectName && (
                <span className="flex items-center gap-1">
                  <span 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: task.projectColor || "#888" }}
                  ></span>
                  {task.projectName}
                </span>
              )}
              {task.dueDate && (
                <span>Due: {format(task.dueDate, "MMM d")}</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={(e) => {
          e.stopPropagation();
          handleEdit();
        }}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      
      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
      />
    </>
  );
}
