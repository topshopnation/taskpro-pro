
import { SortGroupControls } from "@/components/overdue/SortGroupControls";

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
  return (
    <div className="flex items-center justify-end space-x-2">
      <SortGroupControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        groupBy={groupBy}
        onSortChange={onSortChange}
        onGroupChange={onGroupChange}
      />
    </div>
  );
}
