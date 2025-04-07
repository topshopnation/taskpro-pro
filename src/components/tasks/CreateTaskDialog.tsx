
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TaskFormContent } from "@/components/tasks/TaskFormContent"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { TaskFormValues } from "@/components/tasks/taskTypes"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultProjectId?: string
}

export function CreateTaskDialog({ open, onOpenChange, defaultProjectId }: CreateTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [formValues, setFormValues] = useState<TaskFormValues>({
    title: "",
    notes: "",
    dueDate: undefined,
    priority: "4",
    project: "inbox",
    section: "",
    tags: []
  })

  useEffect(() => {
    if (defaultProjectId && open) {
      setFormValues(prev => ({
        ...prev,
        project: defaultProjectId
      }))
    }
  }, [defaultProjectId, open])

  const handleSubmit = async () => {
    if (!formValues.title.trim()) {
      toast.error("Task title is required")
      return
    }

    if (!user) {
      toast.error("You must be logged in to create a task")
      return
    }

    setIsLoading(true)

    try {
      // First, insert the task
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: formValues.title,
          notes: formValues.notes,
          due_date: formValues.dueDate ? formValues.dueDate.toISOString() : null,
          priority: parseInt(formValues.priority),
          project_id: formValues.project === "inbox" ? null : formValues.project,
          section: formValues.section || null,
          completed: false,
          favorite: false,
          user_id: user.id
        })
        .select('id')
        .single()

      if (taskError) throw taskError

      // Then, if there are tags, create task-tag associations
      if (formValues.tags.length > 0) {
        const taskTagRelations = formValues.tags.map(tagId => ({
          task_id: taskData.id,
          tag_id: tagId,
          user_id: user.id
        }))

        const { error: tagRelationError } = await supabase
          .from('task_tags')
          .insert(taskTagRelations)

        if (tagRelationError) throw tagRelationError
      }

      toast.success("Task created successfully")
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(`Error creating task: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormValues({
      title: "",
      notes: "",
      dueDate: undefined,
      priority: "4",
      project: "inbox",
      section: "",
      tags: []
    })
  }

  const handleFormChange = (values: Partial<TaskFormValues>) => {
    setFormValues(prev => ({
      ...prev,
      ...values
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
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
            {isLoading ? "Adding..." : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
