
import { TaskFormValues } from "@/components/tasks/taskTypes"
import { TaskPrioritySelector } from "@/components/tasks/TaskPrioritySelector"
import { TagInput } from "@/components/tasks/TagInput"
import { TaskFormTitle } from "@/components/tasks/form/TaskFormTitle"
import { TaskFormNotes } from "@/components/tasks/form/TaskFormNotes"
import { TaskFormDueDate } from "@/components/tasks/form/TaskFormDueDate"
import { TaskFormProject } from "@/components/tasks/form/TaskFormProject"
import { Label } from "@/components/ui/label"
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form"

interface TaskFormContentProps {
  values: TaskFormValues;
  onChange: (values: Partial<TaskFormValues>) => void;
}

export function TaskFormContent({ values, onChange }: TaskFormContentProps) {
  // Create a simple wrapper that makes the form fields work with the onChange handler
  const handleFieldChange = (field: keyof TaskFormValues, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="grid gap-4 py-4">
      <TaskFormTitle 
        title={values.title}
        onChange={(title) => handleFieldChange('title', title)}
      />
      
      <TaskFormNotes 
        notes={values.notes}
        onChange={(notes) => handleFieldChange('notes', notes)}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <TaskFormDueDate 
          dueDate={values.dueDate}
          onChange={(dueDate) => handleFieldChange('dueDate', dueDate)}
        />
        
        <div className="grid gap-2">
          <Label>Priority</Label>
          <TaskPrioritySelector 
            value={values.priority} 
            onChange={(value) => handleFieldChange('priority', value)}
          />
        </div>
      </div>
      
      <TaskFormProject 
        projectId={values.project}
        onChange={(project) => handleFieldChange('project', project)}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <TagInput 
          selectedTags={values.tags || []} 
          onChange={(tags) => handleFieldChange('tags', tags)}
        />
      </div>
    </div>
  )
}
