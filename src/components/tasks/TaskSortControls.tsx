
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
  onAddTask?: () => void
  showProjectSort?: boolean
  hideAddTaskButton?: boolean
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
  return (
    <div className="flex items-center space-x-2">
      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
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
          {showProjectSort && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("asc"); }}>
                Sort by Project (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("desc"); }}>
                Sort by Project (Z-A)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Group Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
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
          {showProjectSort && (
            <DropdownMenuItem onClick={() => setGroupBy("project")}>
              Group by Project
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {!hideAddTaskButton && onAddTask && (
        <Button 
          onClick={onAddTask}
          className="flex items-center space-x-1 h-9"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      )}
    </div>
  )
}
