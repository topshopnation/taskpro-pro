
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/tasks/TaskItem";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { TaskFormContent } from "@/components/tasks/TaskFormContent";
import { TaskFormValues } from "@/components/tasks/taskTypes";
import { queryClient } from "@/lib/react-query";

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
    tags: []
  });

  // Fetch task tags when task changes
  useEffect(() => {
    const fetchTaskTags = async () => {
      if (!task || !user) return;
      
      try {
        // Use type assertion to bypass TypeScript constraints
        const { data, error } = await (supabase as any)
          .from('task_tags')
          .select('tag_id')
          .eq('task_id', task.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const tagIds = data.map((item: any) => item.tag_id);
        
        setFormValues(prev => ({
          ...prev,
          tags: tagIds
        }));
      } catch (error: any) {
        toast.error("Failed to fetch task tags", {
          description: error.message
        });
      }
    };

    // Initialize form values when task changes
    if (task) {
      setFormValues({
        title: task.title,
        notes: task.notes || "",
        dueDate: task.dueDate,
        priority: task.priority.toString(),
        project: task.projectId || "inbox",
        tags: []  // Will be set by fetchTaskTags
      });
      
      fetchTaskTags();
    }
  }, [task, user]);

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
      // Update task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: formValues.title,
          notes: formValues.notes,
          due_date: formValues.dueDate ? formValues.dueDate.toISOString() : null,
          priority: parseInt(formValues.priority),
          project_id: formValues.project === "inbox" ? null : formValues.project
        })
        .eq('id', task.id);

      if (taskError) throw taskError;

      // Delete all existing tag associations for this task
      // Use type assertion to bypass TypeScript constraints
      const { error: deleteError } = await (supabase as any)
        .from('task_tags')
        .delete()
        .eq('task_id', task.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Create new tag associations
      if (formValues.tags.length > 0) {
        const taskTagRelations = formValues.tags.map(tagId => ({
          task_id: task.id,
          tag_id: tagId,
          user_id: user.id
        }));

        // Use type assertion to bypass TypeScript constraints
        const { error: tagRelationError } = await (supabase as any)
          .from('task_tags')
          .insert(taskTagRelations);

        if (tagRelationError) throw tagRelationError;
      }

      // Invalidate queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['search-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['completedTasks'] });
      
      // Specifically for the Filter page, invalidate filtered task queries
      if (window.location.pathname.includes('/filters/')) {
        const filterId = window.location.pathname.split('/')[2];
        if (filterId) {
          queryClient.invalidateQueries({ queryKey: ['filter', filterId] });
        }
      }

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
