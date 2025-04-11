
import { ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";

export interface SortOption {
  value: string;
  label: string;
}

export interface GroupOption {
  value: string | null;
  label: string;
}

interface SortGroupControlsProps {
  sortBy: string;
  sortDirection: "asc" | "desc";
  groupBy: string | null;
  onSortChange: (sortBy: string, direction: "asc" | "desc") => void;
  onGroupChange: (groupBy: string | null) => void;
  sortOptions: SortOption[];
  groupOptions: GroupOption[];
  className?: string;
}

export function SortGroupControls({ 
  sortBy, 
  sortDirection, 
  groupBy,
  onSortChange,
  onGroupChange,
  sortOptions,
  groupOptions,
  className = ""
}: SortGroupControlsProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            {sortDirection === "asc" 
              ? <ArrowDownAZ className="h-4 w-4" /> 
              : <ArrowUpZA className="h-4 w-4" />}
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map(option => (
            <DropdownMenuItem 
              key={`sort-${option.value}-asc`}
              onClick={() => onSortChange(option.value, "asc")}
              className={sortBy === option.value && sortDirection === "asc" ? "font-medium bg-muted/50" : ""}
            >
              {option.label} (A-Z)
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {sortOptions.map(option => (
            <DropdownMenuItem 
              key={`sort-${option.value}-desc`}
              onClick={() => onSortChange(option.value, "desc")}
              className={sortBy === option.value && sortDirection === "desc" ? "font-medium bg-muted/50" : ""}
            >
              {option.label} (Z-A)
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Group</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Group Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {groupOptions.map(option => (
            <DropdownMenuItem 
              key={`group-${option.value || "none"}`}
              onClick={() => onGroupChange(option.value)}
              className={groupBy === option.value ? "font-medium bg-muted/50" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
