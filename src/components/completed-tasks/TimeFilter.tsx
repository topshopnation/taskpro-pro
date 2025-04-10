
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon, Sun, Sofa, ArrowRight, Clock } from "lucide-react"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1",
          value === "today" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("today")}
      >
        <CalendarIcon className="h-3.5 w-3.5" />
        <span>Today</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1",
          value === "tomorrow" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("tomorrow")}
      >
        <Sun className="h-3.5 w-3.5" />
        <span>Tomorrow</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1",
          value === "weekend" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("weekend")}
      >
        <Sofa className="h-3.5 w-3.5" />
        <span>Weekend</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-1",
          value === "next-week" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("next-week")}
      >
        <ArrowRight className="h-3.5 w-3.5" />
        <span>Next Week</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          value === "week" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("week")}
      >
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        <span>Last 7 Days</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className={cn(
          value === "all" ? "bg-primary/10 border-primary" : ""
        )}
        onClick={() => onChange("all")}
      >
        <span>All Time</span>
      </Button>
    </div>
  )
}
