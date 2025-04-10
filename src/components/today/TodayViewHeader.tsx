
import { CalendarClock } from "lucide-react"
import { format } from "date-fns"

export function TodayViewHeader() {
  const today = new Date()
  const formattedDate = format(today, "EEEE, MMMM d")

  return (
    <div className="flex items-center space-x-2">
      <CalendarClock className="h-6 w-6" />
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
    </div>
  )
}
