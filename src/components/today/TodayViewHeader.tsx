
import { CalendarClock } from "lucide-react"
import { format } from "date-fns"

export function TodayViewHeader() {
  const today = new Date()
  const formattedDate = format(today, "EEEE, MMMM d")

  return (
    <div className="flex items-center space-x-2 py-1">
      <CalendarClock className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 text-primary" />
      <div>
        <h1 className="text-xl md:text-2xl font-bold leading-tight">Today</h1>
        <p className="text-xs md:text-sm text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  )
}
