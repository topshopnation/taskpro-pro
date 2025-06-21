
import { cn } from "@/lib/utils";

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
  completed,
}: TaskItemDetailsProps) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className={cn(
        "font-medium text-xs leading-4 break-words",
        completed && "line-through text-muted-foreground"
      )}>
        {title}
      </h3>
    </div>
  );
}
