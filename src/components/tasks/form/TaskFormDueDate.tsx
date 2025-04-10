
import { format, addDays, nextSaturday, nextMonday } from "date-fns"
import { CalendarIcon, Sun, Sofa, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface TaskFormDueDateProps {
  dueDate?: Date;
  onChange: (date: Date | undefined) => void;
}

export function TaskFormDueDate({ dueDate, onChange }: TaskFormDueDateProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = addDays(today, 1);
  const weekend = nextSaturday(today);
  const nextWeek = nextMonday(today);
  
  return (
    <div className="grid gap-2">
      <Label>Due Date</Label>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1",
            dueDate && format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? "bg-primary/10 border-primary" : ""
          )}
          onClick={() => onChange(today)}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>Today</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1",
            dueDate && format(dueDate, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd') ? "bg-primary/10 border-primary" : ""
          )}
          onClick={() => onChange(tomorrow)}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Tomorrow</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1",
            dueDate && format(dueDate, 'yyyy-MM-dd') === format(weekend, 'yyyy-MM-dd') ? "bg-primary/10 border-primary" : ""
          )}
          onClick={() => onChange(weekend)}
        >
          <Sofa className="h-3.5 w-3.5" />
          <span>Weekend</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-1",
            dueDate && format(dueDate, 'yyyy-MM-dd') === format(nextWeek, 'yyyy-MM-dd') ? "bg-primary/10 border-primary" : ""
          )}
          onClick={() => onChange(nextWeek)}
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>Next week</span>
        </Button>
      </div>
      
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={(date) => onChange(date || undefined)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Need to import Label at the top
import { Label } from "@/components/ui/label"
