
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { TaskFormContent } from "@/components/tasks/TaskFormContent";
import { TaskFormValues } from "@/components/tasks/taskTypes";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [formValues, setFormValues] = useState<TaskFormValues>({
    title: "",
    notes: "",
    dueDate: undefined,
    priority: "4",
    project: "inbox",
    section: ""
  });

  // Initialize form values when task changes
  useEffect(() => {
    if (task) {
      setFormValues({
        title: task.title,
        notes: task.notes || "",
        dueDate: task.dueDate,
        priority: task.priority.toString(),
        project: task.projectId || "inbox",
        section: task.section || ""
      });
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!formValues.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!user || !task) {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: formValues.title,
          notes: formValues.notes,
          due_date: formValues.dueDate ? formValues.dueDate.toISOString() : null,
          priority: parseInt(formValues.priority),
          project_id: formValues.project === "inbox" ? null : formValues.project,
          section: formValues.section || null
        })
        .eq('id', task.id);

      if (error) throw error;

      toast.success("Task updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error updating task: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (values: Partial<TaskFormValues>) => {
    setFormValues(prev => ({
      ...prev,
      ...values
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <TaskFormContent 
          values={formValues}
          onChange={handleFormChange}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
