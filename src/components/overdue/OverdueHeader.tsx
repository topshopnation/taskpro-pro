
import { Clock, CalendarRange } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OverdueHeaderProps {
  onRescheduleClick: () => void
  taskCount: number
}

export function OverdueHeader({ onRescheduleClick, taskCount }: OverdueHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Clock className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Overdue</h1>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRescheduleClick}
          className="flex items-center space-x-1.5"
          disabled={taskCount === 0}
        >
          <CalendarRange className="h-4 w-4" />
          <span>Reschedule All</span>
        </Button>
      </div>
    </div>
  )
}
