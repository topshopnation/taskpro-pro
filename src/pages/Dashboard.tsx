
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { StatCards } from "@/components/dashboard/StatCards";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { CompletedTasksStats } from "@/components/dashboard/CompletedTasksStats";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useCompletedTasks } from "@/hooks/useCompletedTasks";
import { Task } from "@/components/tasks/taskTypes";

const Dashboard = () => {
  const { data, isLoading: isTasksLoading } = useDashboardTasks();
  const { data: completedData, isLoading: isCompletedLoading } = useCompletedTasks();
  const { completeTask, deleteTask } = useTaskOperations();

  if (isTasksLoading || isCompletedLoading) {
    return <DashboardSkeleton />;
  }

  const { todayTasks = [], highPriorityTasks = [], allTasks = [] } = data || {};
  const { totalCompleted = 0 } = completedData || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <SubscriptionBanner />
      
      <StatCards 
        todayCount={todayTasks.length}
        highPriorityCount={highPriorityTasks.length}
        totalCount={allTasks.length}
        completedCount={totalCompleted}
      />

      <DashboardTabs
        todayTasks={todayTasks}
        highPriorityTasks={highPriorityTasks}
        allTasks={allTasks}
        onComplete={completeTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default Dashboard;
