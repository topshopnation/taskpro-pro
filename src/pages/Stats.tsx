
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";
import { useCompletedTasks } from "@/hooks/useCompletedTasks";
import { StatCards } from "@/components/dashboard/StatCards";
import { CompletedTasksStats } from "@/components/dashboard/CompletedTasksStats";
import { Task } from "@/components/tasks/taskTypes";

const Stats = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardTasks();
  const { totalCompleted, isLoading: isCompletedLoading } = useCompletedTasks();

  if (isDashboardLoading || isCompletedLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const { todayTasks = [], highPriorityTasks = [], allTasks = [] } = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statistics</h1>
      </div>
      
      <StatCards 
        todayCount={todayTasks.length}
        overdueCount={0}
        highPriorityCount={highPriorityTasks.length}
        totalCount={allTasks.length}
        completedCount={totalCompleted}
      />

      <Card>
        <CardHeader>
          <CardTitle>Task Analytics</CardTitle>
          <CardDescription>
            Visual breakdown of your task data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts tasks={allTasks} />
        </CardContent>
      </Card>

      <CompletedTasksStats />
    </div>
  );
};

export default Stats;
