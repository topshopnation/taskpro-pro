
import { Calendar, Clock, Tag as TagIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tag } from "./taskTypes"

interface TaskItemDetailsProps {
  title: string
  notes?: string
  dueDate?: Date
  dueTime?: string
  completed: boolean
  tags?: Tag[]
  projectName?: string
}

export function TaskItemDetails({ 
  title, 
  notes, 
  dueDate, 
  dueTime, 
  completed,
  tags = [],
  projectName
}: TaskItemDetailsProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col">
        <div className="flex items-start">
          <h3 className={cn(
            "text-sm font-medium truncate",
            completed && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {dueDate && (
            <span className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(dueDate, "MMM d, yyyy")}
              {dueTime && (
                <span className="ml-1 flex items-center">
                  <Clock className="h-3 w-3 mx-1" />
                  {dueTime}
                </span>
              )}
            </span>
          )}
          
          {projectName && (
            <span className="text-xs text-muted-foreground flex items-center">
              <span className="h-2 w-2 bg-blue-400 rounded-full mr-1"></span>
              {projectName}
            </span>
          )}
        </div>
        
        {notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notes}
          </p>
        )}
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map(tag => (
              <Badge 
                key={tag.id} 
                variant="outline"
                className="text-xs py-0 px-1"
              >
                <TagIcon className="mr-1 h-2 w-2" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
