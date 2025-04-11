
import { CalendarClock, Plus } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface TodayViewHeaderProps {
  onAddTask?: () => void;
  tasksCount?: number;
}

export function TodayViewHeader({ onAddTask, tasksCount }: TodayViewHeaderProps) {
  const today = new Date()
  const formattedDate = format(today, "EEEE, MMMM d")

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2">
        <CalendarClock className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-primary" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight">Today</h1>
          <p className="text-xs md:text-sm text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      
      {onAddTask && (
        <Button 
          onClick={onAddTask} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      )}
    </div>
  )
}
