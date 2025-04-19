
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getDateLabelWithDay } from "@/utils/dateUtils"

interface TaskFormDueDateProps {
  dueDate?: Date;
  onChange: (date: Date | undefined) => void;
}

export function TaskFormDueDate({ dueDate, onChange }: TaskFormDueDateProps) {
  const [timeInput, setTimeInput] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  // Initialize timeInput when dueDate changes, but only if it has hours/minutes set
  useEffect(() => {
    if (dueDate) {
      // Only set time input if the hours or minutes are not zero (indicating time was set)
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

  // Handle setting a date without time
  const handleDateSelection = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }
    
    if (timeInput) {
      // If time was already set by the user, preserve it
      const dateWithTime = addTimeToDate(date, timeInput);
      onChange(dateWithTime);
    } else {
      // Set time to beginning of day (midnight) when no time is specified
      const dateWithoutTime = new Date(date);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onChange(dateWithoutTime);
    }
    
    // Close popover after selection
    setOpen(false);
  };

  // Handle quick date selection (Today, Tomorrow, etc.)
  const handleQuickDateSelection = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      setOpen(false);
      return;
    }
    
    // For quick selections, we preserve any time that might have been set previously
    if (timeInput) {
      const dateWithTime = addTimeToDate(date, timeInput);
      onChange(dateWithTime);
    } else {
      const dateWithoutTime = new Date(date);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onChange(dateWithoutTime);
    }
    
    // Close popover after selection
    setOpen(false);
  };

  // Handle setting time for a date
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeInput = e.target.value;
    setTimeInput(newTimeInput);
    
    // If we already have a date, update it with the new time
    if (dueDate && newTimeInput) {
      const dateWithTime = addTimeToDate(dueDate, newTimeInput);
      onChange(dateWithTime);
    } else if (dueDate && !newTimeInput) {
      // If time input is cleared, reset to beginning of day
      const dateWithoutTime = new Date(dueDate);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onChange(dateWithoutTime);
    }
  };

  // Clear time input and reset date to midnight
  const handleClearTime = () => {
    setTimeInput("");
    if (dueDate) {
      const dateWithoutTime = new Date(dueDate);
      dateWithoutTime.setHours(0, 0, 0, 0);
      onChange(dateWithoutTime);
    }
  };

  const dateLabel = dueDate ? getDateLabelWithDay(dueDate) : { label: "Pick a date", day: "" };
  
  // Only show time in the label if it's not empty and not midnight (00:00)
  const shouldShowTime = timeInput && timeInput !== "00:00";
  
  return (
    <div className="grid gap-2">
      <Label>Due Date</Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? (
              <span>
                {dateLabel.label}{' '}
                <span className="text-muted-foreground">{dateLabel.day}</span>
                {shouldShowTime && <span className="ml-1 text-muted-foreground">at {timeInput}</span>}
              </span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 z-50" 
          align="start" 
          side="bottom" 
          sideOffset={5}
          alignOffset={0}
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
              {timeInput && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 p-0" 
                  onClick={handleClearTime}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="sr-only">Clear time</span>
                </Button>
              )}
            </div>
            
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={handleDateSelection}
              initialFocus
              showQuickOptions={true}
              onQuickOptionSelect={handleQuickDateSelection}
              className="rounded-md border shadow-sm bg-background pointer-events-auto"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
