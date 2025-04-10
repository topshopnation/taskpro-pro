
import { Plus, ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { SortDirection } from "@/utils/taskSortUtils"

interface TaskSortControlsProps {
  sortBy: string
  setSortBy: (value: string) => void
  sortDirection: SortDirection
  setSortDirection: (value: SortDirection) => void
  groupBy: string | null
  setGroupBy: (value: string | null) => void
  onAddTask: () => void
}

export function TaskSortControls({
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy,
  onAddTask
}: TaskSortControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            {sortDirection === "asc" 
              ? <ArrowDownAZ className="h-4 w-4" /> 
              : <ArrowUpZA className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("asc"); }}>
            Sort by Name (A-Z)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("desc"); }}>
            Sort by Name (Z-A)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("asc"); }}>
            Sort by Due Date (Earliest)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("desc"); }}>
            Sort by Due Date (Latest)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Group Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Layers className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setGroupBy(null)}>
            No Grouping
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setGroupBy("title")}>
            Group by Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
            Group by Due Date
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        onClick={onAddTask}
        className="flex items-center space-x-1"
      >
        <Plus className="h-4 w-4" />
        <span>Add Task</span>
      </Button>
    </div>
  )
}
