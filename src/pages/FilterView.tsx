
import { useParams } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { useFetchFilter } from "@/hooks/useFetchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterOperations } from "@/hooks/filter/useFilterOperations";
import { FilterDialogs } from "@/components/filters/FilterDialogs";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Task } from "@/components/tasks/taskTypes";

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
  const { deleteFilter, updateFilter } = useFilterOperations();

  const handleEdit = () => {
    if (currentFilter) {
      setFilterName(currentFilter.name);
      setFilterColor(currentFilter.color || "");
      setFilterConditions(currentFilter.conditions || { items: [], logic: "and" });
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleRename = async () => {
    if (filterId && currentFilter) {
      await updateFilter(filterId, {
        name: filterName,
        color: filterColor,
        conditions: filterConditions
      });
      setIsEditDialogOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (filterId) {
      await deleteFilter(filterId);
    }
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

      <FilterDialogs
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        filterName={filterName}
        filterColor={filterColor}
        filterConditions={filterConditions}
        onEditDialogChange={setIsEditDialogOpen}
        onDeleteDialogChange={setIsDeleteDialogOpen}
        onFilterNameChange={setFilterName}
        onFilterColorChange={setFilterColor}
        onFilterConditionsChange={setFilterConditions}
        onRename={handleRename}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}
