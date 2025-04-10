
import { Button } from "@/components/ui/button"
import { Plus, ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface TodaySortControlsProps {
  sortBy: string
  setSortBy: (value: string) => void
  sortDirection: "asc" | "desc"
  setSortDirection: (value: "asc" | "desc") => void
  groupBy: string | null
  setGroupBy: (value: string | null) => void
  onAddTask: () => void
}

export function TodaySortControls({
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  groupBy,
  setGroupBy,
  onAddTask
}: TodaySortControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {sortDirection === "asc" 
                    ? <ArrowDownAZ className="h-4 w-4" /> 
                    : <ArrowUpZA className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Sort tasks</TooltipContent>
          </Tooltip>
          
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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("asc"); }}>
              Sort by Project (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("desc"); }}>
              Sort by Project (Z-A)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Layers className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Group tasks</TooltipContent>
          </Tooltip>
          
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setGroupBy(null)}>
              No Grouping
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setGroupBy("title")}>
              Group by Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy("project")}>
              Group by Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
              Group by Due Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onAddTask}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Create a new task</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
