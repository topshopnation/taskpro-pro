
import { useState } from "react"
import { format } from "date-fns"
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
        // Get the current task to preserve time if it exists
        const { data: taskData, error: fetchError } = await supabase
          .from('tasks')
          .select('due_date')
          .eq('id', taskId)
          .single()
          
        if (fetchError) throw fetchError
        
        // Determine the time component to preserve
        let timeComponent = "T12:00:00"
        if (taskData?.due_date) {
          const existingDate = new Date(taskData.due_date)
          // Only use existing time if it's not midnight (00:00:00)
          if (existingDate.getHours() !== 0 || existingDate.getMinutes() !== 0) {
            const hours = existingDate.getHours().toString().padStart(2, '0')
            const minutes = existingDate.getMinutes().toString().padStart(2, '0')
            timeComponent = `T${hours}:${minutes}:00`
          }
        }
        
        // Update with new date but preserve time
        const { error } = await supabase
          .from('tasks')
          .update({ due_date: `${formattedDate}${timeComponent}` })
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

  const handleDateSelection = (date: Date | undefined) => {
    setRescheduleDate(date);
  };

  const handleOpen = (open: boolean) => {
    // If opening the dialog, set a default date (today)
    if (open && !rescheduleDate) {
      const today = new Date();
      setRescheduleDate(today);
    }
    onOpenChange(open)
  }

  // Create a function to properly check if a date is before today (start of day)
  const isDateBeforeToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Handle clicks on dialog content to prevent event bubbling
  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[425px]" onClick={handleDialogContentClick}>
        <DialogHeader>
          <DialogTitle>Reschedule All Overdue Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 pointer-events-auto">
          <div className="flex justify-center pointer-events-auto">
            <Calendar
              mode="single"
              selected={rescheduleDate}
              onSelect={handleDateSelection}
              disabled={isDateBeforeToday} // Use the function to check if date is before today
              showQuickOptions={true}
              onQuickOptionSelect={handleDateSelection}
              className="rounded-md border shadow-sm bg-background pointer-events-auto"
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
