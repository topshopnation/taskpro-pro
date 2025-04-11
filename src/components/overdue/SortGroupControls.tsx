
import { ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"

interface SortGroupControlsProps {
  sortBy: string
  sortDirection: "asc" | "desc"
  groupBy: string | null
  onSortChange: (sortBy: string, direction: "asc" | "desc") => void
  onGroupChange: (groupBy: string | null) => void
}

export function SortGroupControls({ 
  sortBy, 
  sortDirection, 
  groupBy,
  onSortChange,
  onGroupChange
}: SortGroupControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {sortDirection === "asc" 
              ? <ArrowDownAZ className="h-4 w-4" /> 
              : <ArrowUpZA className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("title", "asc")}>
            Sort by Name (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("title", "desc")}>
            Sort by Name (Z-A)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange("dueDate", "asc")}>
            Sort by Due Date (Earliest)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("dueDate", "desc")}>
            Sort by Due Date (Latest)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange("priority", "asc")}>
            Sort by Priority (High-Low)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("priority", "desc")}>
            Sort by Priority (Low-High)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSortChange("project", "asc")}>
            Sort by Project (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("project", "desc")}>
            Sort by Project (Z-A)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onGroupChange(null)}>
            No Grouping
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onGroupChange("title")}>
            Group by Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGroupChange("priority")}>
            Group by Priority
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGroupChange("project")}>
            Group by Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGroupChange("dueDate")}>
            Group by Due Date
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
