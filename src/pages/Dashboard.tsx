
import AppLayout from "@/components/layout/AppLayout";
import { StatCards } from "@/components/dashboard/StatCards";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useDashboardTasks } from "@/hooks/useDashboardTasks";

export default function Dashboard() {
  const { 
    tasks,
    isLoading, 
    todayTasks, 
    favoriteTasks, 
    highPriorityTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useDashboardTasks();

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
        </div>

        <StatCards 
          todayCount={todayTasks.length}
          favoritesCount={favoriteTasks.length}
          highPriorityCount={highPriorityTasks.length}
        />

        <DashboardTabs
          todayTasks={todayTasks}
          favoriteTasks={favoriteTasks}
          highPriorityTasks={highPriorityTasks}
          allTasks={tasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>
    </AppLayout>
  );
}
