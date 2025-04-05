
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
    1: "text-taskpro-priority-1",
    2: "text-taskpro-priority-2",
    3: "text-taskpro-priority-3",
    4: "text-muted-foreground"
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
          Priority {priority}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
