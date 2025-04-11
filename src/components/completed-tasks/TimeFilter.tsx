
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  CalendarIcon, 
  Sun, 
  Sofa, 
  ArrowRight, 
  Clock, 
  CalendarDays 
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function TimeFilter({ value, onChange }: TimeFilterProps) {
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
      <PopoverContent align="end" className="w-60 p-0" side="bottom">
        <div className="flex flex-col divide-y">
          <TimeFilterOption 
            icon={<CalendarDays className="h-4 w-4 text-blue-500" />} 
            label="Today" 
            selected={value === "today"} 
            dayLabel="Today"
            onClick={() => onChange("today")} 
          />
          
          <TimeFilterOption 
            icon={<Sun className="h-4 w-4 text-orange-400" />} 
            label="Tomorrow" 
            selected={value === "tomorrow"} 
            dayLabel="Sat"
            onClick={() => onChange("tomorrow")} 
          />
          
          <TimeFilterOption 
            icon={<Sofa className="h-4 w-4 text-purple-500" />} 
            label="This Weekend" 
            selected={value === "weekend"} 
            dayLabel="Sat"
            onClick={() => onChange("weekend")} 
          />
          
          <TimeFilterOption 
            icon={<ArrowRight className="h-4 w-4 text-purple-600" />} 
            label="Next Week" 
            selected={value === "next-week"} 
            dayLabel="Mon"
            onClick={() => onChange("next-week")} 
          />
          
          <TimeFilterOption 
            icon={<Clock className="h-4 w-4 text-blue-400" />} 
            label="Last 7 Days" 
            selected={value === "week"} 
            dayLabel=""
            onClick={() => onChange("week")} 
          />
          
          <TimeFilterOption 
            icon={<CalendarIcon className="h-4 w-4 text-gray-500" />} 
            label="All Time" 
            selected={value === "all"} 
            dayLabel=""
            onClick={() => onChange("all")} 
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TimeFilterOption({ 
  icon, 
  label, 
  selected, 
  dayLabel,
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  selected: boolean; 
  dayLabel?: string;
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
