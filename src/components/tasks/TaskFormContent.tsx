
import { TaskFormValues } from "@/components/tasks/taskTypes"
import { TaskPrioritySelector } from "@/components/tasks/TaskPrioritySelector"
import { TagInput } from "@/components/tasks/TagInput"
import { TaskFormTitle } from "@/components/tasks/form/TaskFormTitle"
import { TaskFormNotes } from "@/components/tasks/form/TaskFormNotes"
import { TaskFormDueDate } from "@/components/tasks/form/TaskFormDueDate"
import { TaskFormProject } from "@/components/tasks/form/TaskFormProject"

interface TaskFormContentProps {
  values: TaskFormValues;
  onChange: (values: Partial<TaskFormValues>) => void;
}

export function TaskFormContent({ values, onChange }: TaskFormContentProps) {
  return (
    <div className="grid gap-4 py-4">
      <TaskFormTitle 
        title={values.title}
        onChange={(title) => onChange({ title })}
      />
      
      <TaskFormNotes 
        notes={values.notes}
        onChange={(notes) => onChange({ notes })}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <TaskFormDueDate 
          dueDate={values.dueDate}
          onChange={(dueDate) => onChange({ dueDate })}
        />
        
        <div className="grid gap-2">
          <Label>Priority</Label>
          <TaskPrioritySelector 
            value={values.priority} 
            onChange={(value) => onChange({ priority: value })}
          />
        </div>
      </div>
      
      <TaskFormProject 
        projectId={values.project}
        onChange={(project) => onChange({ project })}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <TagInput 
          selectedTags={values.tags || []} 
          onChange={(tags) => onChange({ tags })}
        />
      </div>
    </div>
  )
}

// Need to import Label for the Priority section
import { Label } from "@/components/ui/label"
