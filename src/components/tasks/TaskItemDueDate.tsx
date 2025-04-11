
import { format, addDays, nextSaturday, nextMonday, isSameDay, addMonths } from "date-fns"
import { 
  Calendar as CalendarIcon, 
  Sun, 
  Sofa, 
  ArrowRight, 
  Clock, 
  XCircle, 
  CalendarDays,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-mobile"

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
  const [showTwoMonths, setShowTwoMonths] = useState(!isMobile)
  
  // Update showTwoMonths when screen size changes
  useEffect(() => {
    setShowTwoMonths(!isMobile)
  }, [isMobile])
  
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
      
      <PopoverContent align="end" className="w-80 p-0" side="right">
        <div className="flex flex-col divide-y">
          <div className="p-3">
            <Input
              type="text"
              placeholder="Type a date or recurring pattern"
              className="h-9 text-sm"
            />
          </div>
          
          <DateOptionButton
            icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
            label="Today"
            dayLabel="Today"
            selected={dueDate && isSameDay(dueDate, today)}
            onClick={() => handleDateTimeSelection(today)}
          />
          
          <DateOptionButton
            icon={<Sun className="h-4 w-4 text-orange-400" />}
            label="Tomorrow" 
            dayLabel={format(tomorrow, "EEE")}
            selected={dueDate && isSameDay(dueDate, tomorrow)}
            onClick={() => handleDateTimeSelection(tomorrow)}
          />
          
          <DateOptionButton
            icon={<Sofa className="h-4 w-4 text-purple-500" />}
            label="This Weekend"
            dayLabel={format(weekend, "EEE")}
            selected={dueDate && isSameDay(dueDate, weekend)}
            onClick={() => handleDateTimeSelection(weekend)}
          />
          
          <DateOptionButton
            icon={<ArrowRight className="h-4 w-4 text-purple-600" />}
            label="Next Week"
            dayLabel={format(nextWeek, "EEE")}
            selected={dueDate && isSameDay(dueDate, nextWeek)}
            onClick={() => handleDateTimeSelection(nextWeek)}
          />
          
          <DateOptionButton
            icon={<RotateCcw className="h-4 w-4 text-blue-400" />}
            label="Postpone"
            dayLabel={format(nextWeek, "EEE")}
            selected={false}
            onClick={() => handleDateTimeSelection(addDays(today, 7))}
          />
          
          <DateOptionButton
            icon={<XCircle className="h-4 w-4 text-gray-500" />}
            label="No Date"
            selected={!dueDate}
            onClick={() => onDateChange(undefined)}
          />

          <div className="p-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1 mb-2">
                <Input
                  type="time"
                  placeholder="Add time"
                  value={timeInput}
                  onChange={handleTimeInputChange}
                  className="h-8 py-1"
                />
              </div>
              
              <div className="flex flex-col md:flex-row gap-0 md:gap-2">
                <CalendarComponent
                  mode="single" 
                  selected={dueDate}
                  onSelect={handleDateTimeSelection}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  initialFocus
                  className={cn("p-3 pointer-events-auto rounded border shadow-sm")}
                />
                
                {showTwoMonths && (
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={handleDateTimeSelection}
                    month={addMonths(currentMonth, 1)}
                    onMonthChange={(month) => setCurrentMonth(addMonths(month, -1))}
                    className={cn("p-3 pointer-events-auto rounded border shadow-sm hidden md:block")}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function DateOptionButton({ 
  icon, 
  label, 
  dayLabel, 
  selected, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  dayLabel?: string; 
  selected: boolean; 
  onClick: () => void; 
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50",
        selected && "bg-primary/10"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {dayLabel && (
        <span className="text-sm text-muted-foreground">{dayLabel}</span>
      )}
    </div>
  );
}
