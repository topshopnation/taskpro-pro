
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
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
  const [timeInput, setTimeInput] = useState<string>(dueDate ? format(dueDate, "HH:mm") : "");
  
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
      onChange(undefined);
      return;
    }
    
    if (timeInput) {
      const dateWithTime = addTimeToDate(date, timeInput);
      onChange(dateWithTime);
    } else {
      onChange(date);
    }
  };

  // Handle setting time for a date
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeInput(e.target.value);
    
    // If we already have a date, update it with the new time
    if (dueDate && e.target.value) {
      const dateWithTime = addTimeToDate(dueDate, e.target.value);
      onChange(dateWithTime);
    }
  };

  const dateLabel = dueDate ? getDateLabelWithDay(dueDate) : { label: "Pick a date", day: "" };
  
  return (
    <div className="grid gap-2">
      <Label>Due Date</Label>
      
      <Popover>
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
              </span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start" side="bottom" sideOffset={5}>
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
              initialFocus
              showQuickOptions={true}
              onQuickOptionSelect={handleDateTimeSelection}
              className="rounded-md border shadow-sm bg-background pointer-events-auto"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
