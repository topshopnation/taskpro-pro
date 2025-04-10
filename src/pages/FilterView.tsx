
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { FilterDialogs } from "@/components/filters/FilterDialogs";
import { useFilter } from "@/hooks/useFilter";
import { Button } from "@/components/ui/button";
import { TaskSortControls } from "@/components/tasks/TaskSortControls";
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists";
import { groupTasks } from "@/utils/taskSortUtils";

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

  const groupedTasks = groupTasks(filteredTasks, groupBy, sortBy, sortDirection);

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
          
          <TaskSortControls
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            hideAddTaskButton={true}
            showProjectSort={true}
          />
        </div>

        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No tasks match this filter</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filter criteria.</p>
            </div>
          ) : (
            <GroupedTaskLists
              groupedTasks={groupedTasks}
              groupBy={groupBy}
              isLoadingTasks={isLoading}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onAddTask={() => {}}
              onFavoriteToggle={handleFavoriteToggle}
              hideTitle={!groupBy}
            />
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
