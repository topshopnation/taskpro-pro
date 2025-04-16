
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTodayViewTasks } from "@/hooks/useTodayViewTasks";
import { TodayViewHeader } from "@/components/today/TodayViewHeader";
import { TodaySortControls } from "@/components/today/TodaySortControls";
import { TaskList } from "@/components/tasks/TaskList";
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { EmptyTodayState } from "@/components/today/EmptyTodayState";
import { groupTasks } from "@/utils/todayViewUtils";
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";

export default function TodayView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { tasks, isLoading, handleComplete, handleDelete, handleFavoriteToggle } = useTodayViewTasks();

  // Handle adding task
  const handleAddTask = () => {
    setIsCreateTaskOpen(true);
  };

  // Group tasks when needed
  const groupedTasks = groupBy 
    ? groupTasks(tasks, groupBy, sortField, sortDirection)
    : { "Today's Tasks": tasks };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-10 space-y-4">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <SubscriptionBanner />
        
        <SubscriptionRestriction>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TodayViewHeader onAddTask={handleAddTask} />
            <TodaySortControls 
              sortBy={sortField}
              setSortBy={setSortField}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
            />
          </div>

          {tasks.length === 0 ? (
            <EmptyTodayState onAddTask={handleAddTask} />
          ) : groupBy ? (
            <GroupedTaskLists
              groupedTasks={groupedTasks}
              groupBy={groupBy}
              isLoadingTasks={isLoading}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
              onAddTask={handleAddTask}
            />
          ) : (
            <TaskList
              title="Today's Tasks"
              tasks={tasks}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
        </SubscriptionRestriction>

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
    </AppLayout>
  );
}
