
import { format, addDays, nextSaturday, nextMonday, isSameDay } from "date-fns"
import { Calendar as CalendarIcon, Sun, Sofa, ArrowRight, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useState } from "react"
import { Input } from "@/components/ui/input"

interface TaskItemDueDateProps {
  dueDate?: Date
  onDateChange: (date: Date | undefined) => void
  isUpdating: boolean
}

export function TaskItemDueDate({ dueDate, onDateChange, isUpdating }: TaskItemDueDateProps) {
  const isOverdue = dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [timeInput, setTimeInput] = useState<string>(dueDate ? format(dueDate, "HH:mm") : "")
  
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

  // Function to add time to a date
  const addTimeToDate = (date: Date, timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours || 0);
    newDate.setMinutes(minutes || 0);
    return newDate;
  };

  // Handle setting a date with time
  const handleDateTimeSelection = (date: Date | undefined) => {
    if (!date) {
      onDateChange(undefined);
      return;
    }
    
    if (timeInput) {
      const dateWithTime = addTimeToDate(date, timeInput);
      onDateChange(dateWithTime);
    } else {
      onDateChange(date);
    }
  };

  // Handle setting time for a date
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
    
    // If we already have a date, update it with the new time
    if (dueDate && e.target.value) {
      const dateWithTime = addTimeToDate(dueDate, e.target.value);
      onDateChange(dateWithTime);
    }
  };
  
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
      
      <PopoverContent align="end" className="w-auto p-0" side="right">
        <div className="p-2">
          <div className="mb-3 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-left font-normal"
              onClick={() => handleDateTimeSelection(today)}
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
              onClick={() => handleDateTimeSelection(tomorrow)}
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
              onClick={() => handleDateTimeSelection(weekend)}
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
              onClick={() => handleDateTimeSelection(nextWeek)}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              <span>Next Week</span>
              <span className="ml-auto text-sm text-muted-foreground">
                {format(nextWeek, "MMM d")}
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2 border-t border-b py-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              placeholder="Add time"
              value={timeInput}
              onChange={handleTimeInputChange}
              className="h-8 py-1"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between px-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                className="h-7 w-7 p-0"
              >
                &lt;
              </Button>
              
              <div className="text-sm font-medium">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                className="h-7 w-7 p-0"
              >
                &gt;
              </Button>
            </div>
            
            <CalendarComponent
              mode="single" 
              selected={dueDate}
              onSelect={handleDateTimeSelection}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
          
          {dueDate && (
            <div className="mt-2 flex justify-between border-t pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive flex items-center gap-1"
                onClick={() => onDateChange(undefined)}
              >
                <XCircle className="h-3.5 w-3.5" />
                No Date
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
