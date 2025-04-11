
import { SortGroupControls, SortOption, GroupOption } from "@/components/shared/SortGroupControls";

interface TodaySortControlsProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
  groupBy: string | null;
  setGroupBy: (value: string | null) => void;
  onAddTask?: () => void;
}

export function TodaySortControls({
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy,
  onAddTask,
}: TodaySortControlsProps) {
  const handleSortChange = (newSortBy: string, newDirection: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const sortOptions: SortOption[] = [
    { value: "title", label: "Title" },
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "project", label: "Project" }
  ];

  const groupOptions: GroupOption[] = [
    { value: null, label: "No Grouping" },
    { value: "title", label: "By Title" },
    { value: "priority", label: "By Priority" },
    { value: "project", label: "By Project" },
    { value: "dueDate", label: "By Due Date" }
  ];

  return (
    <SortGroupControls
      sortBy={sortBy}
      sortDirection={sortDirection}
      groupBy={groupBy}
      onSortChange={handleSortChange}
      onGroupChange={setGroupBy}
      sortOptions={sortOptions}
      groupOptions={groupOptions}
    />
  );
}
