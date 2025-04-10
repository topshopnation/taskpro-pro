
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
          <div className="p-2">
            <div className="mb-3 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left font-normal"
                onClick={() => onChange(today)}
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
                onClick={() => onChange(tomorrow)}
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
                onClick={() => onChange(weekend)}
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
                onClick={() => onChange(nextWeek)}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Next Week</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {format(nextWeek, "MMM d")}
                </span>
              </Button>
            </div>
            
            <div className="border-t pt-3">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => onChange(date || undefined)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Need to import Label at the top
import { Label } from "@/components/ui/label"
