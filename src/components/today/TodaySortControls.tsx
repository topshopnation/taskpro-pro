
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Filter, ArrowDown, ArrowUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsMobile } from "@/hooks/use-mobile"

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
  onAddTask,
}: TodaySortControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const sortOptions = [
    { value: "dueDate", label: "Due Date" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title" },
  ]

  const groupOptions = [
    { value: null, label: "No Grouping" },
    { value: "priority", label: "By Priority" },
    { value: "project", label: "By Project" },
  ]

  const handleSort = (value: string) => {
    setSortBy(value)
    setIsOpen(false)
  }

  const handleGroup = (value: string | null) => {
    setGroupBy(value)
    setIsOpen(false)
  }

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="flex items-center gap-1 md:gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="flex gap-1 h-9">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Sort & Group</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSort(option.value)}
              >
                <span className={sortBy === option.value ? "font-semibold" : ""}>
                  {option.label}
                </span>
                {sortBy === option.value && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "A-Z" : "Z-A"}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Group Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {groupOptions.map((option) => (
              <DropdownMenuItem
                key={option.value || "none"}
                onClick={() => handleGroup(option.value)}
              >
                <span className={groupBy === option.value ? "font-semibold" : ""}>
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        onClick={toggleSortDirection}
        className="h-9 px-2 flex-shrink-0"
      >
        {sortDirection === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>

      <Button 
        onClick={onAddTask} 
        size={isMobile ? "sm" : "default"}
        className="h-9 sm:h-10"
      >
        <Plus className="h-4 w-4 mr-1" />
        <span className={isMobile ? "hidden sm:inline" : ""}>Add Task</span>
      </Button>
    </div>
  )
}
