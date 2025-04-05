
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Task } from "./TaskItem"

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate)
  const [priority, setPriority] = useState(task.priority.toString())
  const [project, setProject] = useState(task.projectId)
  const [section, setSection] = useState(task.section || "")

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      setTitle(task.title)
      setNotes(task.notes || "")
      setDueDate(task.dueDate)
      setPriority(task.priority.toString())
      setProject(task.projectId)
      setSection(task.section || "")
    }
  }, [task, open])

  // Priority colors for the flag icon
  const priorityColors: Record<string, string> = {
    "1": "text-taskpro-priority-1",
    "2": "text-taskpro-priority-2",
    "3": "text-taskpro-priority-3",
    "4": "text-muted-foreground"
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Task title is required")
      return
    }

    // TODO: Update task in Supabase database
    console.log({
      id: task.id,
      title,
      notes,
      dueDate,
      priority: parseInt(priority) as 1 | 2 | 3 | 4,
      projectId: project,
      section: section || undefined,
    })

    toast.success("Task updated successfully")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <RadioGroup 
                value={priority} 
                onValueChange={setPriority}
                className="flex space-x-1"
              >
                {["1", "2", "3", "4"].map((value) => (
                  <div key={value} className="flex items-center">
                    <RadioGroupItem 
                      value={value} 
                      id={`edit-priority-${value}`} 
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`edit-priority-${value}`}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md border border-input",
                        priority === value ? "border-2 border-primary" : "hover:bg-accent"
                      )}
                    >
                      <Flag className={cn("h-4 w-4", priorityColors[value])} />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="edit-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-section">Section (optional)</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger id="edit-section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inprogress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
