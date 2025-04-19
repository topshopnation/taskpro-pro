
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TimeInputProps {
  timeInput: string
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearTime: () => void
}

export function TimeInput({ timeInput, onTimeChange, onClearTime }: TimeInputProps) {
  // Add handler to prevent click event propagation
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className="flex items-center space-x-2 pointer-events-auto"
      onClick={handleContainerClick}
    >
      <Input
        type="time"
        placeholder="Add time"
        value={timeInput}
        onChange={onTimeChange}
        className="h-7 py-1"
        onClick={(e) => e.stopPropagation()}
      />
      {timeInput && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 p-0" 
          onClick={(e) => {
            e.stopPropagation();
            onClearTime();
          }}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="sr-only">Clear time</span>
        </Button>
      )}
    </div>
  )
}
