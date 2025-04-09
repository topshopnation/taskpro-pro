
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

interface TaskItemPriorityProps {
  priority: number
}

export function TaskItemPriority({ priority }: TaskItemPriorityProps) {
  // Priority colors for the flag icon
  const priorityColors: Record<number, string> = {
    1: "text-red-500", // P1: Red
    2: "text-yellow-500", // P2: Yellow
    3: "text-green-500", // P3: Green
    4: "text-blue-500" // P4: Blue
  }
  
  // Priority labels
  const priorityLabels: Record<number, string> = {
    1: "Priority 1 (Highest)",
    2: "Priority 2 (High)",
    3: "Priority 3 (Medium)",
    4: "Priority 4 (Low)"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Flag className={cn("h-4 w-4", priorityColors[priority])} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {priorityLabels[priority]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
