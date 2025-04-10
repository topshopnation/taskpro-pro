import { useState } from "react"
import { format, addDays, startOfWeek, endOfWeek, addWeeks } from "date-fns"
import { CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Task } from "@/components/tasks/TaskItem"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  onSuccess: () => void
}

export function RescheduleDialog({ open, onOpenChange, tasks, onSuccess }: RescheduleDialogProps) {
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [quickOption, setQuickOption] = useState<string>("")

  const today = new Date()
  const tomorrow = addDays(today, 1)
  const thisWeekendStart = startOfWeek(addDays(today, 5), { weekStartsOn: 6 }) // Saturday
  const thisWeekendEnd = endOfWeek(thisWeekendStart, { weekStartsOn: 6 }) // Sunday
  const nextWeekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1) // Next Monday

  const handleQuickOptionChange = (value: string) => {
    setQuickOption(value)
    
    switch (value) {
      case "today":
        setRescheduleDate(today)
        break
      case "tomorrow":
        setRescheduleDate(tomorrow)
        break
      case "thisWeekend":
        setRescheduleDate(thisWeekendStart)
        break
      case "nextWeek":
        setRescheduleDate(nextWeekStart)
        break
      default:
        // Keep current custom date if any
        break
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      toast.error("Please select a date")
      return
    }
    
    try {
      setIsRescheduling(true)
      const formattedDate = format(rescheduleDate, 'yyyy-MM-dd')
      const taskIds = tasks.map(task => task.id)
      
      if (taskIds.length === 0) {
        toast.error("No overdue tasks to reschedule")
        return
      }
      
      for (const taskId of taskIds) {
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: `${formattedDate}T12:00:00` })
          .eq('id', taskId)
          
        if (error) throw error
      }
      
      toast.success(`Rescheduled ${taskIds.length} tasks to ${format(rescheduleDate, 'PPP')}`)
      onOpenChange(false)
      setRescheduleDate(undefined)
      setQuickOption("")
      onSuccess()
    } catch (error: any) {
      toast.error("Failed to reschedule tasks", {
        description: error.message
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleOpen = (open: boolean) => {
    // If opening the dialog, set a default date (tomorrow)
    if (open && !rescheduleDate) {
      setRescheduleDate(tomorrow)
      setQuickOption("tomorrow")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule All Overdue Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={quickOption} onValueChange={handleQuickOptionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a date option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="thisWeekend">This Weekend</SelectItem>
              <SelectItem value="nextWeek">Next Week</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={rescheduleDate}
              onSelect={(date) => {
                setRescheduleDate(date)
                setQuickOption("custom")
              }}
              disabled={(date) => date < new Date()}
              className="rounded-md border pointer-events-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} will be rescheduled
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!rescheduleDate || tasks.length === 0 || isRescheduling}
          >
            Reschedule All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
