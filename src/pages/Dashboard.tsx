
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { StatCards } from "@/components/dashboard/StatCards"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { useDashboardTasks } from "@/hooks/useDashboardTasks"
import { Button } from "@/components/ui/button"
import { ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Task } from "@/components/tasks/TaskItem"

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  
  const { 
    tasks,
    isLoading, 
    todayTasks, 
    favoriteTasks, 
    highPriorityTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useDashboardTasks();

  // Sort function
  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortBy === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } else if (sortBy === "dueDate") {
        // Handle null or undefined dates
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1
        
        return sortDirection === "asc" 
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime()
      } else if (sortBy === "project") {
        const projectA = a.projectId || "none"
        const projectB = b.projectId || "none"
        return sortDirection === "asc" 
          ? projectA.localeCompare(projectB)
          : projectB.localeCompare(projectA)
      }
      return 0
    })
  }

  // Apply sorting to all task lists
  const sortedAllTasks = sortTasks(tasks.filter(task => !task.completed))
  const sortedTodayTasks = sortTasks(todayTasks)
  const sortedFavoriteTasks = sortTasks(favoriteTasks)
  const sortedHighPriorityTasks = sortTasks(highPriorityTasks)

  // Group function for future implementation if needed
  const groupTasks = (tasksToGroup: Task[]) => {
    if (!groupBy) return { "All Tasks": sortTasks(tasksToGroup) }
    
    const grouped: Record<string, Task[]> = {}
    
    tasksToGroup.forEach(task => {
      let groupKey = ""
      
      if (groupBy === "project") {
        groupKey = task.projectId || "No Project"
      } else if (groupBy === "dueDate") {
        groupKey = task.dueDate 
          ? format(task.dueDate, 'PPP') 
          : "No Due Date"
      } else if (groupBy === "title") {
        // Group by first letter of title
        groupKey = task.title.charAt(0).toUpperCase()
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }
      grouped[groupKey].push(task)
    })
    
    // Sort each group
    Object.keys(grouped).forEach(key => {
      grouped[key] = sortTasks(grouped[key])
    })
    
    return grouped
  }

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("asc"); }}>
                  Sort by Project (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("desc"); }}>
                  Sort by Project (Z-A)
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
                <DropdownMenuItem onClick={() => setGroupBy("project")}>
                  Group by Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
                  Group by Due Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <StatCards 
          todayCount={todayTasks.length}
          favoritesCount={favoriteTasks.length}
          highPriorityCount={highPriorityTasks.length}
        />

        <DashboardTabs
          todayTasks={sortedTodayTasks}
          favoriteTasks={sortedFavoriteTasks}
          highPriorityTasks={sortedHighPriorityTasks}
          allTasks={sortedAllTasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>
    </AppLayout>
  );
}
