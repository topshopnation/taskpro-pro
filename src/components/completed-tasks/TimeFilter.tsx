
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { getQuickDateOptions } from "@/utils/dateUtils"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const quickOptions = getQuickDateOptions();

  const handleQuickOptionSelect = (date: Date | undefined, optionValue: string) => {
    setDate(date);
    onChange(optionValue);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{getTimeFilterLabel(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2" side="bottom">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col divide-y border rounded-md bg-background">
            {quickOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleQuickOptionSelect(option.date, option.value === "today" ? "today" : 
                                                       option.value === "tomorrow" ? "tomorrow" : 
                                                       option.value === "next-week" ? "next-week" : 
                                                       option.value === "weekend" ? "weekend" : "all")}
                className={cn(
                  "flex items-center justify-between p-2 text-sm hover:bg-muted transition-colors",
                  (option.value === "today" && value === "today") ||
                  (option.value === "tomorrow" && value === "tomorrow") ||
                  (option.value === "next-week" && value === "next-week") ||
                  (option.value === "weekend" && value === "weekend") ||
                  (option.value === "no-date" && value === "all") ? "bg-primary/10" : ""
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-muted-foreground">{option.day}</span>
              </button>
            ))}
            <button
              onClick={() => onChange("week")}
              className={cn(
                "flex items-center justify-between p-2 text-sm hover:bg-muted transition-colors",
                value === "week" && "bg-primary/10"
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">Last 7 Days</span>
              </div>
            </button>
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (newDate) {
                // Custom date handling if needed
              }
            }}
            className="rounded-md border shadow-sm bg-background"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getTimeFilterLabel(value: string): string {
  switch (value) {
    case 'today': return 'Today';
    case 'tomorrow': return 'Tomorrow';
    case 'weekend': return 'This Weekend';
    case 'next-week': return 'Next Week';
    case 'week': return 'Last 7 Days';
    case 'all': return 'All Time';
    default: return 'All Time';
  }
}
