
import * as React from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"

interface SortOption {
  value: string;
  label: string;
}

interface SortControlsProps {
  sortOptions: SortOption[];
  groupOptions: SortOption[];
  sortBy: string;
  setSortBy: (value: string) => void;
  sortDirection: "asc" | "desc";
  setSortDirection: (value: "asc" | "desc") => void;
  groupBy: string | null;
  setGroupBy: (value: string | null) => void;
}

export function SortControls({
  sortOptions,
  groupOptions,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground mr-2">Sort:</span>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 w-[110px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
        className="h-8 w-8 p-0"
      >
        {sortDirection === "asc" ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle sort direction</span>
      </Button>

      <div className="flex items-center">
        <span className="text-sm text-muted-foreground mr-2">Group:</span>
        <Select 
          value={groupBy || "none"} 
          onValueChange={(value) => setGroupBy(value === "none" ? null : value)}
        >
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            {groupOptions.map((option) => (
              <SelectItem 
                key={option.value || "none"} 
                value={option.value || "none"}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
