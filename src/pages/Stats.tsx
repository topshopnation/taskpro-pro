
import { useState } from "react"
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { StatCards } from "@/components/dashboard/StatCards";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import { sortTasks } from "@/utils/taskSortUtils";
import { Task } from "@/components/tasks/TaskItem";
import { BarChart2 } from "lucide-react";
import { useOverdueTasks } from "@/hooks/useOverdueTasks";
import { useAuth } from "@/hooks/use-auth";

export default function Stats() {
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

  // Apply default sorting to all task lists
  const sortedAllTasks = sortTasks(tasks.filter(task => !task.completed), "dueDate", "asc")
  const sortedTodayTasks = sortTasks(todayTasks, "dueDate", "asc")
  const sortedHighPriorityTasks = sortTasks(highPriorityTasks, "dueDate", "asc")

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
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
          </div>
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
