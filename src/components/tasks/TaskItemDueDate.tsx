
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
  const [timeInput, setTimeInput] = useState<string>(dueDate ? format(dueDate, "HH:mm") : "")
  const isMobile = useMediaQuery("(max-width: 768px)")
  
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

  const dateLabel = dueDate ? getDateLabelWithDay(dueDate) : { label: "No due date", day: "" };
  
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
              : `Due: ${dateLabel.label} ${dateLabel.day}`
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
      >
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              type="time"
              placeholder="Add time"
              value={timeInput}
              onChange={handleTimeInputChange}
              className="h-8 py-1"
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
            className="rounded-md border shadow-sm bg-background"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
