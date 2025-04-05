
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { useFilter } from "@/hooks/useFilter";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { FilterDialogs } from "@/components/filters/FilterDialogs";

export default function FilterView() {
  const navigate = useNavigate();
  const {
    currentFilter,
    isLoading,
    isEditFilterOpen,
    setIsEditFilterOpen,
    isDeleteFilterOpen,
    setIsDeleteFilterOpen,
    newFilterName,
    setNewFilterName,
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete
  } = useFilter();

  const {
    filteredTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useFilteredTasks(currentFilter);
  
  // Update filter name when current filter changes
  useEffect(() => {
    if (currentFilter) {
      setNewFilterName(currentFilter.name);
    }
  }, [currentFilter, setNewFilterName]);

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
        <FilterHeader
          filter={currentFilter}
          onFavoriteToggle={handleFilterFavoriteToggle}
          onRenameClick={() => {
            setNewFilterName(currentFilter.name);
            setIsEditFilterOpen(true);
          }}
          onDeleteClick={() => setIsDeleteFilterOpen(true)}
        />

        <TaskList
          title="Filtered Tasks"
          tasks={filteredTasks}
          emptyMessage="No tasks match this filter"
          onComplete={handleComplete}
          onDelete={handleDelete}
          onFavoriteToggle={handleFavoriteToggle}
        />

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
