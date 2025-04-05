
import { useState } from "react"
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

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState<Date>()
  const [priority, setPriority] = useState("4") // Default to lowest priority
  const [project, setProject] = useState("inbox")
  const [section, setSection] = useState("")

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

    // TODO: Add task to Supabase database
    console.log({
      title,
      notes,
      dueDate,
      priority: parseInt(priority),
      project,
      section: section || null,
      completed: false,
      favorite: false
    })

    toast.success("Task created successfully")
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTitle("")
    setNotes("")
    setDueDate(undefined)
    setPriority("4")
    setProject("inbox")
    setSection("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
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
                      id={`priority-${value}`} 
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`priority-${value}`}
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
              <Label htmlFor="project">Project</Label>
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="project">
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
              <Label htmlFor="section">Section (optional)</Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger id="section">
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
          <Button onClick={handleSubmit}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
