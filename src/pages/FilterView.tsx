
import { useParams } from "react-router-dom";
import { TaskList } from "@/components/tasks/TaskList";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { useFetchFilter } from "@/hooks/filter/useFetchFilter";
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
  
  const { filter, isLoading: isFilterLoading } = useFetchFilter(filterId || "");
  const { data: tasks = [], isLoading: isTasksLoading } = useFilteredTasks(filterId || "");
  const { completeTask, deleteTask } = useTaskOperations();
  const { deleteFilter } = useFilterOperations();

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
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

  if (!filter) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Filter not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FilterHeader 
        filter={filter}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
        filter={filter}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
