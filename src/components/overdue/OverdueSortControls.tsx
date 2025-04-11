
import { SortGroupControls, SortOption, GroupOption } from "@/components/shared/SortGroupControls";

interface OverdueSortControlsProps {
  sortBy: string;
  sortDirection: "asc" | "desc";
  groupBy: string | null;
  onSortChange: (sortBy: string, direction: "asc" | "desc") => void;
  onGroupChange: (groupBy: string | null) => void;
}

export function OverdueSortControls({
  sortBy,
  sortDirection,
  groupBy,
  onSortChange,
  onGroupChange
}: OverdueSortControlsProps) {
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
      onSortChange={onSortChange}
      onGroupChange={onGroupChange}
      sortOptions={sortOptions}
      groupOptions={groupOptions}
    />
  );
}
