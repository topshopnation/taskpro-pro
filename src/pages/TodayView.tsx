
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTodayViewTasks } from "@/hooks/useTodayViewTasks";
import { TaskList } from "@/components/tasks/TaskList";
import { TodayViewHeader } from "@/components/today/TodayViewHeader";
import { TodaySortControls } from "@/components/today/TodaySortControls";
import { EmptyTodayState } from "@/components/today/EmptyTodayState";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { sortTasks } from "@/utils/taskSortUtils";
import { groupTasksBy } from "@/utils/todayViewUtils";
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";

export default function TodayView() {
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const { todayTasks, isLoading, error, handleComplete, handleDelete } = useTodayViewTasks();

  // Apply sorting
  const sortedTasks = sortTasks(todayTasks, sortBy, sortDirection);
  
  // Apply grouping if specified
  const groupedTasks = groupBy ? groupTasksBy(sortedTasks, groupBy) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <SubscriptionBanner />
        
        <TodayViewHeader 
          tasksCount={todayTasks.length} 
          onAddTask={() => setIsCreateTaskOpen(true)} 
        />

        {todayTasks.length > 0 && (
          <TodaySortControls
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onAddTask={() => setIsCreateTaskOpen(true)}
          />
        )}

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-muted h-16 rounded-md"></div>
            ))}
          </div>
        ) : todayTasks.length === 0 ? (
          <EmptyTodayState onAddTask={() => setIsCreateTaskOpen(true)} />
        ) : groupedTasks ? (
          <GroupedTaskLists 
            groupedTasks={groupedTasks} 
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        ) : (
          <TaskList 
            tasks={sortedTasks} 
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        )}

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultDueDate={new Date()}
        />
      </div>
    </AppLayout>
  );
}
