
import { useParams } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { useFetchFilter } from "@/hooks/useFetchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterOperations } from "@/hooks/filter/useFilterOperations";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function FilterView() {
  const { filterId } = useParams<{ filterId: string }>();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterConditions, setFilterConditions] = useState({ items: [], logic: "and" });
  
  const { currentFilter, isLoading: isFilterLoading } = useFetchFilter(filterId || "");
  const { data: tasks = [], isLoading: isTasksLoading } = useFilteredTasks(filterId || "");
  const { completeTask, deleteTask } = useTaskOperations();
  const { deleteFilter, updateFilter } = useFilterOperations(filterId || "");

  const handleEdit = () => {
    if (currentFilter) {
      setFilterName(currentFilter.name);
      setFilterColor(currentFilter.color || "");
      
      // Properly handle conditions type conversion
      const conditions = currentFilter.conditions;
      if (conditions && typeof conditions === 'object' && !Array.isArray(conditions)) {
        // If conditions is an object with items property
        if ('items' in conditions && Array.isArray(conditions.items)) {
          setFilterConditions(conditions as { items: any[]; logic: string; });
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
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleRename = async () => {
    if (filterId && currentFilter) {
      await updateFilter(filterName, filterConditions, filterColor);
      setIsEditDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (filterId) {
      await deleteFilter();
    }
  };

  const handleFavoriteToggle = () => {
    // Implementation for favorite toggle
    console.log("Toggle favorite");
  };

  const handleColorChange = (color: string) => {
    setFilterColor(color);
  };

  if (isFilterLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!currentFilter) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Filter not found</p>
      </div>
    );
  }

  // Add logic property if missing
  const filterWithLogic = {
    ...currentFilter,
    logic: (currentFilter as any).logic || "and"
  };

  return (
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
        onComplete={completeTask}
        onDelete={deleteTask}
        hideTitle={true}
      />
    </div>
  );
}
