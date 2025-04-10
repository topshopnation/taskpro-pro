
import { useState } from "react"
import { format } from "date-fns"
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

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: Task[]
  onSuccess: () => void
}

export function RescheduleDialog({ open, onOpenChange, tasks, onSuccess }: RescheduleDialogProps) {
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined)
  const [isRescheduling, setIsRescheduling] = useState(false)

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
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setRescheduleDate(tomorrow)
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
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={rescheduleDate}
              onSelect={setRescheduleDate}
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
