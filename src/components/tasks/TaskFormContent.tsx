
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskFormValues, ProjectOption } from "@/components/tasks/taskTypes"
import { TaskPrioritySelector } from "@/components/tasks/TaskPrioritySelector"
import { useTaskProjects } from "@/components/tasks/useTaskProjects"
import { TagInput } from "@/components/tasks/TagInput"
import { Button } from "@/components/ui/button"

interface TaskFormContentProps {
  values: TaskFormValues;
  onChange: (values: Partial<TaskFormValues>) => void;
}

export function TaskFormContent({ values, onChange }: TaskFormContentProps) {
  const { projects } = useTaskProjects();
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="What needs to be done?"
          autoFocus
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={values.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Add additional details"
          className="resize-none"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !values.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {values.dueDate ? format(values.dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={values.dueDate}
                onSelect={(date) => onChange({ dueDate: date || undefined })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label>Priority</Label>
          <TaskPrioritySelector 
            value={values.priority} 
            onChange={(value) => onChange({ priority: value })}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="project">Project</Label>
        <Select 
          value={values.project} 
          onValueChange={(value) => onChange({ project: value })}
        >
          <SelectTrigger id="project">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox" className="flex items-center gap-2">
              <span>Inbox</span>
            </SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
