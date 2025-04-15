
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { getDateLabelWithDay } from "@/utils/dateUtils"

interface DueDateButtonProps {
  dueDate?: Date
  isOverdue: boolean
  isUpdating: boolean
  timeString: string
}

export function DueDateButton({ dueDate, isOverdue, isUpdating, timeString }: DueDateButtonProps) {
  const dateLabel = dueDate ? getDateLabelWithDay(dueDate) : { label: "No due date", day: "" }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            disabled={isUpdating}
          >
            <CalendarIcon className={cn(
              "h-4 w-4", 
              isOverdue ? "text-red-500" : dueDate ? "text-blue-500" : "text-muted-foreground"
            )} />
            <span className="sr-only">
              {dueDate ? "Change due date" : "Set due date"}
            </span>
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {dueDate 
          ? isOverdue 
            ? `Overdue: ${format(dueDate, "MMM d, yyyy")}${timeString ? ` at ${timeString}` : ""}`
            : `Due: ${dateLabel.label} ${dateLabel.day}${timeString ? ` at ${timeString}` : ""}`
          : "Set due date"
        }
      </TooltipContent>
    </Tooltip>
  )
}
