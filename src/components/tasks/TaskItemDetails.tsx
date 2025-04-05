
import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TaskItemDetailsProps {
  title: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  completed: boolean
}

export function TaskItemDetails({ 
  title, 
  notes, 
  dueDate, 
  dueTime, 
  completed 
}: TaskItemDetailsProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-start">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-sm font-medium truncate",
            completed && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          {notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notes}
            </p>
          )}
        </div>
        <div className="flex items-center ml-2 space-x-1">
          <TooltipProvider>
            {dueDate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {format(dueDate, "PPP")}
                </TooltipContent>
              </Tooltip>
            )}

            {dueTime && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {dueTime}
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
