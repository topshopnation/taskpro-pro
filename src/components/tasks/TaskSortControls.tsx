
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortControls } from "@/components/ui/sort-controls";

interface TaskSortControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
  groupBy: string | null;
  setGroupBy: (value: string | null) => void;
  onAddTask?: () => void;
  showProjectSort?: boolean;
  hideAddTaskButton?: boolean;
}

export function TaskSortControls({
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy,
  onAddTask,
  showProjectSort = false,
  hideAddTaskButton = false
}: TaskSortControlsProps) {
  const sortOptions = [
    { value: "title", label: "Title" },
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    ...(showProjectSort ? [{ value: "project", label: "Project" }] : []),
  ];

  const groupOptions = [
    { value: "none", label: "None" },
    { value: "priority", label: "Priority" },
    { value: "dueDate", label: "Due Date" },
    ...(showProjectSort ? [{ value: "project", label: "Project" }] : []),
  ];

  return (
    <div className="flex items-center gap-2">
      <SortControls
        sortOptions={sortOptions}
        groupOptions={groupOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />
      
      {!hideAddTaskButton && onAddTask && (
        <Button size="sm" onClick={onAddTask} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      )}
    </div>
  );
}
