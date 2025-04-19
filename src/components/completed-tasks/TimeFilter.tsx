
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
  const [open, setOpen] = useState(false);
  const quickOptions = getQuickDateOptions();

  const handleQuickOptionSelect = (date: Date | undefined, optionValue: string) => {
    setDate(date);
    onChange(optionValue);
    setOpen(false);
  };
  
  // Direct handler for quick option selection from Calendar component
  const handleCalendarQuickOptionSelect = (date: Date | undefined) => {
    if (!date) {
      handleQuickOptionSelect(undefined, "all");
      return;
    }
    
    // Map the date to the corresponding filter value based on quick options
    const option = quickOptions.find(opt => 
      opt.date && date && 
      opt.date.getFullYear() === date.getFullYear() &&
      opt.date.getMonth() === date.getMonth() &&
      opt.date.getDate() === date.getDate()
    );
    
    if (option) {
      handleQuickOptionSelect(date, option.value);
    } else {
      // Handle custom date if needed
      setDate(date);
      setOpen(false);
    }
  };

  // Prevent event bubbling on popover content click
  const handlePopoverContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
      <PopoverContent 
        align="end" 
        className="w-auto p-2 z-50" 
        side="bottom"
        onClick={handlePopoverContentClick}
      >
        <div className="flex flex-col space-y-2 pointer-events-auto">
          <div 
            className="flex flex-col divide-y border rounded-md bg-background pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {quickOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickOptionSelect(option.date, option.value);
                }}
                className={cn(
                  "flex items-center justify-between p-2 text-sm hover:bg-muted transition-colors",
                  option.value === value ? "bg-primary/10" : ""
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{option.label}</span>
                </div>
                <span className="text-muted-foreground">{option.day}</span>
              </button>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("week");
              }}
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
            }}
            showQuickOptions={true}
            onQuickOptionSelect={handleCalendarQuickOptionSelect}
            className="rounded-md border shadow-sm bg-background pointer-events-auto"
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
