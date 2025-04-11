
import { SortGroupControls, SortOption, GroupOption } from "@/components/shared/SortGroupControls";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const handleSortChange = (newSortBy: string, newDirection: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const sortOptions: SortOption[] = [
    { value: "title", label: "Title" },
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    ...(showProjectSort ? [{ value: "project", label: "Project" }] : []),
  ];

  const groupOptions: GroupOption[] = [
    { value: null, label: "No Grouping" },
    { value: "title", label: "By Title" },
    { value: "priority", label: "By Priority" },
    { value: "dueDate", label: "By Due Date" },
    ...(showProjectSort ? [{ value: "project", label: "By Project" }] : []),
  ];

  return (
    <div className="flex items-center gap-2">
      {!hideAddTaskButton && onAddTask && (
        <Button 
          size="sm" 
          onClick={onAddTask}
          className="flex items-center gap-1 h-8"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      )}
      
      <SortGroupControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        groupBy={groupBy}
        onSortChange={handleSortChange}
        onGroupChange={setGroupBy}
        sortOptions={sortOptions}
        groupOptions={groupOptions}
      />
    </div>
  );
}
