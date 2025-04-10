
import { CalendarClock } from "lucide-react"

export function TodayViewHeader() {
  return (
    <div className="flex items-center space-x-2">
      <CalendarClock className="h-6 w-6" />
      <h1 className="text-2xl font-bold">Today</h1>
    </div>
  )
}
