
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sun, Sofa, ArrowRight } from "lucide-react"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by time" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="today" className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Today</span>
        </SelectItem>
        <SelectItem value="tomorrow" className="flex items-center">
          <Sun className="mr-2 h-4 w-4" />
          <span>Tomorrow</span>
        </SelectItem>
        <SelectItem value="weekend" className="flex items-center">
          <Sofa className="mr-2 h-4 w-4" />
          <span>This Weekend</span>
        </SelectItem>
        <SelectItem value="next-week" className="flex items-center">
          <ArrowRight className="mr-2 h-4 w-4" />
          <span>Next Week</span>
        </SelectItem>
        <SelectItem value="week">Last 7 Days</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  )
}
