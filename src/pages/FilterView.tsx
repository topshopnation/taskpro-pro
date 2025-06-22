import { useParams } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { useFetchFilter } from "@/hooks/filter/useFetchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterOperations } from "@/hooks/filter/useFilterOperations";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { FilterDialogs } from "@/components/filters/FilterDialogs";
import { isStandardFilter } from "@/utils/filterUtils";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";

export default function FilterView() {
  const { id: filterId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterConditions, setFilterConditions] = useState({ items: [], logic: "and" });
  
  const { currentFilter, isLoading: isFilterLoading } = useFetchFilter();
  const { data: tasks = [], isLoading: isTasksLoading } = useFilteredTasks(filterId || "");
  const { completeTask, deleteTask, toggleTaskFavorite } = useTaskOperations();
  const { deleteFilter, updateFilter, toggleFavorite } = useFilterOperations(filterId || "");

  // Simple completion handler - pass through to useTaskOperations without modification
  const handleCompleteTask = async (taskId: string, completed: boolean) => {
    console.log('FilterView handleCompleteTask:', { taskId, completed });
    return await completeTask(taskId, completed);
  };

  // Simple delete handler - pass through to useTaskOperations without modification
  const handleDeleteTask = async (taskId: string) => {
    console.log('FilterView handleDeleteTask:', taskId);
    await deleteTask(taskId);
  };

  const handleEdit = () => {
    if (!currentFilter) return;
    
    if (isStandardFilter(filterId || "")) {
      toast.error("Cannot edit standard filters");
      return;
    }
    
    setFilterName(currentFilter.name);
    setFilterColor(currentFilter.color || "");
    
    // Properly handle conditions type conversion
    const conditions = currentFilter.conditions;
    if (conditions && typeof conditions === 'object' && !Array.isArray(conditions)) {
      // If conditions is an object with items property
      const conditionsObj = conditions as any;
      if ('items' in conditionsObj && Array.isArray(conditionsObj.items)) {
        setFilterConditions(conditionsObj as { items: any[]; logic: string; });
      } else {
        // If conditions is a plain object, wrap it
        setFilterConditions({ items: [conditions], logic: "and" });
      }
    } else if (Array.isArray(conditions)) {
      // If conditions is an array, wrap it in the expected structure
      setFilterConditions({ items: conditions, logic: "and" });
    } else {
      setFilterConditions({ items: [], logic: "and" });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    if (isStandardFilter(filterId || "")) {
      toast.error("Cannot delete standard filters");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleRename = async () => {
    if (filterId && currentFilter) {
      const success = await updateFilter(filterName, filterConditions, filterColor);
      if (success) {
        setIsEditDialogOpen(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (filterId) {
      await deleteFilter();
      setIsDeleteDialogOpen(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (isStandardFilter(filterId || "")) {
      toast.error("Cannot modify standard filters");
      return;
    }
    
    if (currentFilter) {
      await toggleFavorite(!currentFilter.favorite);
    }
  };

  const handleColorChange = (color: string) => {
    setFilterColor(color);
  };

  if (isFilterLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!currentFilter) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Filter not found</p>
        </div>
      </AppLayout>
    );
  }

  // Add logic property if missing
  const filterWithLogic = {
    ...currentFilter,
    logic: (currentFilter as any).logic || "and"
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <FilterHeader 
          filter={filterWithLogic}
          onFavoriteToggle={handleFavoriteToggle}
          onRenameClick={handleEdit}
          onDeleteClick={handleDelete}
          onColorChange={handleColorChange}
        />
        
        <TaskList
          title=""
          tasks={tasks}
          isLoading={isTasksLoading}
          emptyMessage="No tasks match this filter"
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onFavoriteToggle={toggleTaskFavorite}
          hideTitle={true}
        />

        <FilterDialogs
          isEditDialogOpen={isEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          filterName={filterName}
          filterColor={filterColor}
          filterConditions={filterConditions}
          onEditDialogChange={setIsEditDialogOpen}
          onDeleteDialogChange={setIsDeleteDialogOpen}
          onFilterNameChange={setFilterName}
          onFilterColorChange={handleColorChange}
          onFilterConditionsChange={setFilterConditions}
          onRename={handleRename}
          onDelete={handleConfirmDelete}
        />
      </div>
    </AppLayout>
  );
}
