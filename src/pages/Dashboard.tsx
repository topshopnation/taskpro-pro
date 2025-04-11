
import { useState } from "react"
import { useEffect } from "react";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { StatCards } from "@/components/dashboard/StatCards";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { TaskSortControls } from "@/components/tasks/TaskSortControls";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { sortTasks } from "@/utils/taskSortUtils";
import { Task } from "@/components/tasks/TaskItem";
import { useOverdueTasks } from "@/hooks/useOverdueTasks";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const { user } = useAuth();
  
  const { 
    tasks,
    isLoading, 
    todayTasks, 
    highPriorityTasks,
    handleComplete,
    handleDelete
  } = useDashboardTasks();

  const { data: overdueTasks = [] } = useOverdueTasks(user?.id);

  // Apply sorting to all task lists
  const sortedAllTasks = sortTasks(tasks.filter(task => !task.completed), sortBy, sortDirection)
  const sortedTodayTasks = sortTasks(todayTasks, sortBy, sortDirection)
  const sortedHighPriorityTasks = sortTasks(highPriorityTasks, sortBy, sortDirection)

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          
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

        <StatCards 
          todayCount={todayTasks.length}
          highPriorityCount={highPriorityTasks.length}
          overdueCount={overdueTasks.length}
        />

        <DashboardTabs
          todayTasks={sortedTodayTasks}
          highPriorityTasks={sortedHighPriorityTasks}
          allTasks={sortedAllTasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
    </AppLayout>
  );
}
