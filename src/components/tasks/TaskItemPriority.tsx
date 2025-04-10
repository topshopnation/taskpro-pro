
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskItemPriorityProps {
  priority: number
  onPriorityChange: (priority: 1 | 2 | 3 | 4) => void
  isUpdating: boolean
}

export function TaskItemPriority({ priority, onPriorityChange, isUpdating }: TaskItemPriorityProps) {
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
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={isUpdating}>
                <Flag className={cn("h-4 w-4", priorityColors[priority])} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            {priorityLabels[priority]} (Click to change)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onPriorityChange(1)}
          className="flex items-center"
        >
          <Flag className="h-4 w-4 mr-2 text-red-500" />
          Priority 1 (Highest)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onPriorityChange(2)}
          className="flex items-center"
        >
          <Flag className="h-4 w-4 mr-2 text-yellow-500" />
          Priority 2 (High)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onPriorityChange(3)}
          className="flex items-center"
        >
          <Flag className="h-4 w-4 mr-2 text-green-500" />
          Priority 3 (Medium)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onPriorityChange(4)}
          className="flex items-center"
        >
          <Flag className="h-4 w-4 mr-2 text-blue-500" />
          Priority 4 (Low)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
