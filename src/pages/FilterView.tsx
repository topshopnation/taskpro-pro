import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { FilterDialogs } from "@/components/filters/FilterDialogs";
import { useFilter } from "@/hooks/filter";
import { TaskSortControls } from "@/components/tasks/TaskSortControls";
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists";
import { groupTasks } from "@/utils/taskSortUtils";
import { FilterConditionsDisplay } from "@/components/filters/FilterConditionsDisplay";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "@/components/tasks/EditTaskDialog";
import { Task } from "@/components/tasks/TaskItem";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction";

export default function FilterView() {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const [sortBy, setSortBy] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);

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
    filterConditions,
    setFilterConditions,
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete,
    handleFilterColorChange
  } = useFilter();

  useEffect(() => {
    if (currentFilter && !isLoading) {
      const currentSlug = name;
      const newSlug = currentFilter.name.toLowerCase().replace(/\s+/g, '-');
      
      if (currentSlug !== newSlug) {
        navigate(`/filters/${id}/${newSlug}`, { replace: true });
      }
    }
  }, [currentFilter, id, name, navigate, isLoading]);

  const {
    filteredTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle,
    handlePriorityChange,
    handleDateChange
  } = useFilteredTasks(currentFilter);
  
  useEffect(() => {
    if (currentFilter) {
      setNewFilterName(currentFilter.name);
      setFilterColor(currentFilter.color || "");
      setFilterConditions(currentFilter.conditions || { items: [], logic: "and" });
    }
  }, [currentFilter, setNewFilterName, setFilterColor, setFilterConditions]);

  const groupedTasks = groupTasks(filteredTasks, groupBy, sortBy, sortDirection);

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
  };

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
          <Button onClick={() => navigate('/today')}>Go to Today</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-screen-xl mx-auto">
        <SubscriptionBanner />
        <SubscriptionRestriction>
          <div className="space-y-2">
            <FilterHeader
              filter={currentFilter}
              onFavoriteToggle={handleFilterFavoriteToggle}
              onRenameClick={() => {
                setNewFilterName(currentFilter.name);
                setFilterColor(currentFilter.color || "");
                setFilterConditions(currentFilter.conditions || { items: [], logic: "and" });
                setIsEditFilterOpen(true);
              }}
              onDeleteClick={() => setIsDeleteFilterOpen(true)}
              onColorChange={handleFilterColorChange}
            />
            
            <div className="mt-1">
              <FilterConditionsDisplay 
                conditions={currentFilter.conditions || []} 
                logic={currentFilter.logic}
              />
            </div>
            
            <div className="flex items-center justify-end mt-4">
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
          </div>

          <div className="space-y-6">
            {Object.keys(groupedTasks).length === 0 ? (
              <div className="bg-muted/30 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No tasks match this filter</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filter criteria.</p>
                <Button onClick={() => setIsCreateTaskOpen(true)}>Add Task</Button>
              </div>
            ) : (
              <GroupedTaskLists
                groupedTasks={groupedTasks}
                groupBy={groupBy}
                isLoadingTasks={isLoading}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onAddTask={() => setIsCreateTaskOpen(true)}
                onFavoriteToggle={handleFavoriteToggle}
                onTaskEdit={handleTaskEdit}
                onPriorityChange={handlePriorityChange}
                onDateChange={handleDateChange}
                hideTitle={!groupBy}
              />
            )}
          </div>
        </SubscriptionRestriction>

        <FilterDialogs
          isEditDialogOpen={isEditFilterOpen}
          isDeleteDialogOpen={isDeleteFilterOpen}
          filterName={newFilterName}
          filterColor={filterColor}
          filterConditions={filterConditions}
          onEditDialogChange={setIsEditFilterOpen}
          onDeleteDialogChange={setIsDeleteFilterOpen}
          onFilterNameChange={setNewFilterName}
          onFilterColorChange={setFilterColor}
          onFilterConditionsChange={setFilterConditions}
          onRename={handleFilterRename}
          onDelete={handleFilterDelete}
        />
        
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />

        <EditTaskDialog
          open={isEditTaskOpen}
          onOpenChange={setIsEditTaskOpen}
          task={editingTask}
        />
      </div>
    </AppLayout>
  );
}
