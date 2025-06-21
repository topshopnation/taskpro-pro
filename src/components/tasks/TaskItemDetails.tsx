
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";

interface TaskItemDetailsProps {
  title: string;
  notes?: string;
  dueDate?: Date;
  dueTime?: string;
  completed: boolean;
  tags?: any[];
  projectName?: string;
}

export function TaskItemDetails({
  title,
  notes,
  dueDate,
  dueTime,
  completed,
  tags,
  projectName
}: TaskItemDetailsProps) {
  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0 mb-2 md:mb-0 md:mr-4">
          <h3 className={cn(
            "font-medium text-sm md:text-base leading-5 md:leading-normal break-words",
            completed && "line-through text-muted-foreground"
          )}>
            {title}
          </h3>
          
          {notes && (
            <p className={cn(
              "text-xs md:text-sm text-muted-foreground mt-1 break-words line-clamp-2",
              completed && "line-through"
            )}>
              {notes}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {dueDate && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {formatDueDate(dueDate)}
                {dueTime && ` ${dueTime}`}
              </Badge>
            )}
            
            {projectName && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {projectName}
              </Badge>
            )}
            
            {tags && tags.length > 0 && (
              <>
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs px-1.5 py-0.5">
                    {tag.tags?.name}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
