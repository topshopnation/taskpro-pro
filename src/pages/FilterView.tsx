
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { FilterDialogs } from "@/components/filters/FilterDialogs";
import { useFilter } from "@/hooks/useFilter";
import { Button } from "@/components/ui/button";
import { Task } from "@/components/tasks/TaskItem";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react";

export default function FilterView() {
  const navigate = useNavigate();
  const { filterId } = useParams();
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)

  const {
    currentFilter,
    isLoading,
    isEditFilterOpen,
    setIsEditFilterOpen,
    isDeleteFilterOpen,
    setIsDeleteFilterOpen,
    newFilterName,
    setNewFilterName,
    filterColor,
    setFilterColor,
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete,
    handleFilterColorChange
  } = useFilter();

  const {
    filteredTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useFilteredTasks(currentFilter);
  
  useEffect(() => {
    if (currentFilter) {
      setNewFilterName(currentFilter.name);
    }
  }, [currentFilter, setNewFilterName]);

  const sortTasks = (tasksToSort: Task[]) => {
    return [...tasksToSort].sort((a, b) => {
      if (sortBy === "title") {
        return sortDirection === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      } else if (sortBy === "dueDate") {
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
        groupKey = task.title.charAt(0).toUpperCase()
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = []
      }
      grouped[groupKey].push(task)
    })
    
    Object.keys(grouped).forEach(key => {
      grouped[key] = sortTasks(grouped[key])
    })
    
    return grouped
  }

  const groupedTasks = groupTasks(filteredTasks);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  if (!currentFilter) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-2xl font-bold mb-4">Filter not found</h1>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <FilterHeader
            filter={currentFilter}
            onFavoriteToggle={handleFilterFavoriteToggle}
            onRenameClick={() => {
              setNewFilterName(currentFilter.name);
              setFilterColor(currentFilter.color || "");
              setIsEditFilterOpen(true);
            }}
            onDeleteClick={() => setIsDeleteFilterOpen(true)}
            onColorChange={handleFilterColorChange}
          />
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

        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No tasks match this filter</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            Object.entries(groupedTasks).map(([group, groupTasks]) => (
              <TaskList
                key={group}
                title={groupBy ? group : "Filtered Tasks"}
                tasks={groupTasks}
                emptyMessage="No tasks in this group"
                onComplete={handleComplete}
                onDelete={handleDelete}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))
          )}
        </div>

        <FilterDialogs
          isEditDialogOpen={isEditFilterOpen}
          isDeleteDialogOpen={isDeleteFilterOpen}
          filterName={newFilterName}
          onEditDialogChange={setIsEditFilterOpen}
          onDeleteDialogChange={setIsDeleteFilterOpen}
          onFilterNameChange={setNewFilterName}
          onRename={handleFilterRename}
          onDelete={handleFilterDelete}
        />
      </div>
    </AppLayout>
  );
}
