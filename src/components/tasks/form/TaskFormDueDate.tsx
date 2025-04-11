
import { format, addDays, nextSaturday, nextMonday, isSameDay } from "date-fns"
import { 
  CalendarIcon, 
  Sun, 
  Sofa, 
  ArrowRight, 
  XCircle,
  CalendarDays,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TaskFormDueDateProps {
  dueDate?: Date;
  onChange: (date: Date | undefined) => void;
}

export function TaskFormDueDate({ dueDate, onChange }: TaskFormDueDateProps) {
  const [timeInput, setTimeInput] = useState<string>(dueDate ? format(dueDate, "HH:mm") : "");
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = addDays(today, 1);
  const weekend = nextSaturday(today);
  const nextWeek = nextMonday(today);
  
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
            {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
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
              onClick={() => onChange(undefined)}
            />
            
            <div className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
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
                  className={cn("p-3 pointer-events-auto rounded border shadow-sm")}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
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
