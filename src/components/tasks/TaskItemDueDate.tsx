
import { format, addDays, nextSaturday, nextMonday, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, Sun, Sofa, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface TaskItemDueDateProps {
  dueDate?: Date
  onDateChange: (date: Date | undefined) => void
  isUpdating: boolean
}

export function TaskItemDueDate({ dueDate, onDateChange, isUpdating }: TaskItemDueDateProps) {
  const isOverdue = dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = addDays(today, 1)
  const weekend = nextSaturday(today)
  const nextWeek = nextMonday(today)
  
  const getDateLabel = (date: Date | undefined) => {
    if (!date) return "No due date"
    
    if (isSameDay(date, today)) return "Today"
    if (isSameDay(date, tomorrow)) return "Tomorrow"
    if (isSameDay(date, weekend)) return "This Weekend"
    if (isSameDay(date, nextWeek)) return "Next Week"
    
    return format(date, "MMM d, yyyy")
  }
  
  return (
    <Popover>
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
              ? `Overdue: ${format(dueDate, "MMM d, yyyy")}`
              : `Due: ${getDateLabel(dueDate)}`
            : "Set due date"
          }
        </TooltipContent>
      </Tooltip>
      
      <PopoverContent align="end" className="w-auto p-0">
        <div className="p-2">
          <div className="mb-3 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={() => onDateChange(today)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Today</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {format(today, "EEE")}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={() => onDateChange(tomorrow)}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Tomorrow</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {format(tomorrow, "EEE")}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={() => onDateChange(weekend)}
            >
              <Sofa className="mr-2 h-4 w-4" />
              <span>This Weekend</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {format(weekend, "EEE")}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={() => onDateChange(nextWeek)}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Next Week</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {format(nextWeek, "MMM d")}
              </span>
            </Button>
          </div>
          
          <div className="border-t pt-3">
            <CalendarComponent
              mode="single" 
              selected={dueDate}
              onSelect={onDateChange}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
          
          {dueDate && (
            <div className="mt-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDateChange(undefined)}
              >
                Clear date
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
