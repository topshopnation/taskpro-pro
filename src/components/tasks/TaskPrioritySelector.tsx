
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskPrioritySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function TaskPrioritySelector({ value, onChange }: TaskPrioritySelectorProps) {
  const priorityColors: Record<string, string> = {
    "1": "text-taskpro-priority-1",
    "2": "text-taskpro-priority-2",
    "3": "text-taskpro-priority-3", 
    "4": "text-muted-foreground"
  }

  return (
    <RadioGroup 
      value={value} 
      onValueChange={onChange}
      className="flex space-x-1"
    >
      {["1", "2", "3", "4"].map((priority) => (
        <div key={priority} className="flex items-center">
          <RadioGroupItem 
            value={priority} 
            id={`priority-${priority}`} 
            className="sr-only"
          />
          <Label
            htmlFor={`priority-${priority}`}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border border-input",
              value === priority ? "border-2 border-primary" : "hover:bg-accent"
            )}
          >
            <Flag className={cn("h-4 w-4", priorityColors[priority])} />
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
