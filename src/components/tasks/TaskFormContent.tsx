
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, nextSaturday, nextMonday } from "date-fns"
import { CalendarIcon, Circle, Sun, Sofa, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskFormValues, ProjectOption } from "@/components/tasks/taskTypes"
import { TaskPrioritySelector } from "@/components/tasks/TaskPrioritySelector"
import { useTaskProjects } from "@/components/tasks/useTaskProjects"
import { TagInput } from "@/components/tasks/TagInput"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface TaskFormContentProps {
  values: TaskFormValues;
  onChange: (values: Partial<TaskFormValues>) => void;
}

export function TaskFormContent({ values, onChange }: TaskFormContentProps) {
  const { projects, isLoading } = useTaskProjects();
  
  // Debug logging
  useEffect(() => {
    console.log("Available projects in TaskFormContent:", projects);
  }, [projects]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = addDays(today, 1);
  const weekend = nextSaturday(today);
  const nextWeek = nextMonday(today);
  
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
              <div className="p-2">
                <div className="mb-3 space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onChange({ dueDate: today })}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Today</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {format(today, "EEE")}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onChange({ dueDate: tomorrow })}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Tomorrow</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {format(tomorrow, "EEE")}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onChange({ dueDate: weekend })}
                  >
                    <Sofa className="mr-2 h-4 w-4" />
                    <span>This Weekend</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {format(weekend, "EEE")}
                    </span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => onChange({ dueDate: nextWeek })}
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    <span>Next Week</span>
                    <span className="ml-auto text-sm text-muted-foreground">
                      {format(nextWeek, "MMM d")}
                    </span>
                  </Button>
                </div>
                
                <div className="border-t pt-3">
                  <Calendar
                    mode="single"
                    selected={values.dueDate}
                    onSelect={(date) => onChange({ dueDate: date || undefined })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              </div>
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
            <SelectValue placeholder="Select a project">
              {values.project === "inbox" ? (
                <div className="flex items-center gap-2">
                  <span>Inbox</span>
                </div>
              ) : projects?.find(p => p.id === values.project) ? (
                <div className="flex items-center gap-2">
                  {projects.find(p => p.id === values.project)?.color && (
                    <Circle className="h-3 w-3 fill-current" style={{ color: projects.find(p => p.id === values.project)?.color }} />
                  )}
                  <span>{projects.find(p => p.id === values.project)?.name}</span>
                </div>
              ) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span>Inbox</span>
              </div>
            </SelectItem>
            {projects && projects.map((project) => (
              <SelectItem 
                key={project.id} 
                value={project.id}
              >
                <div className="flex items-center gap-2">
                  {project.color && (
                    <Circle className="h-3 w-3 fill-current" style={{ color: project.color }} />
                  )}
                  <span>{project.name}</span>
                </div>
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
