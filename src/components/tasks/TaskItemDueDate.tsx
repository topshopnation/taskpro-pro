
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-mobile"
import { getDateLabelWithDay } from "@/utils/dateUtils"

interface TaskItemDueDateProps {
  dueDate?: Date
  onDateChange: (date: Date | undefined) => void
  isUpdating: boolean
}

export function TaskItemDueDate({ dueDate, onDateChange, isUpdating }: TaskItemDueDateProps) {
  const isOverdue = dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [timeInput, setTimeInput] = useState<string>("")
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Initialize timeInput when dueDate changes, but only if hours/minutes are not zero
  useEffect(() => {
    if (dueDate) {
      if (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) {
        setTimeInput(format(dueDate, "HH:mm"));
      } else {
        setTimeInput("");
      }
    } else {
      setTimeInput("");
    }
  }, [dueDate]);
  
  // Function to add time to a date
  const addTimeToDate = (date: Date, timeStr: string) => {
    if (!timeStr) return date;
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
      // Set time to beginning of day (midnight) when no time is specified
      const dateWithoutTime = new Date(date);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onDateChange(dateWithoutTime);
    }
  };

  // Handle setting time for a date
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeInput = e.target.value;
    setTimeInput(newTimeInput);
    
    // If we already have a date, update it with the new time
    if (dueDate && newTimeInput) {
      const dateWithTime = addTimeToDate(dueDate, newTimeInput);
      onDateChange(dateWithTime);
    } else if (dueDate && !newTimeInput) {
      // If time input is cleared, reset to beginning of day
      const dateWithoutTime = new Date(dueDate);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onDateChange(dateWithoutTime);
    }
  };

  const dateLabel = dueDate ? getDateLabelWithDay(dueDate) : { label: "No due date", day: "" };
  
  // Format time string for display, only if hours or minutes are not zero
  const timeString = dueDate && (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) 
    ? format(dueDate, "HH:mm") 
    : "";
  
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
              ? `Overdue: ${format(dueDate, "MMM d, yyyy")}${timeString ? ` at ${timeString}` : ""}`
              : `Due: ${dateLabel.label} ${dateLabel.day}${timeString ? ` at ${timeString}` : ""}`
            : "Set due date"
          }
        </TooltipContent>
      </Tooltip>
      
      <PopoverContent 
        align="end" 
        className="w-auto p-2" 
        side={isMobile ? "bottom" : "right"}
        alignOffset={isMobile ? -40 : 0}
        sideOffset={5}
        avoidCollisions={true}
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="time"
              placeholder="Add time"
              value={timeInput}
              onChange={handleTimeInputChange}
              className="h-7 py-1"
            />
          </div>
          
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={handleDateTimeSelection}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            showQuickOptions={true}
            onQuickOptionSelect={handleDateTimeSelection}
            className="rounded-md border shadow-sm bg-background pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
