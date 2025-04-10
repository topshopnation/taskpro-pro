
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompletedTasksStats } from "@/components/dashboard/CompletedTasksStats";

export default function Stats() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [completedPeriod, setCompletedPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  const { 
    tasks,
    isLoading, 
    todayTasks, 
    highPriorityTasks,
    handleComplete,
    handleDelete
  } = useDashboardTasks();

  // Apply default sorting to all task lists
  const sortedAllTasks = sortTasks(tasks.filter(task => !task.completed), "dueDate", "asc")
  const sortedTodayTasks = sortTasks(todayTasks, "dueDate", "asc")
  const sortedHighPriorityTasks = sortTasks(highPriorityTasks, "dueDate", "asc")
  const sortedFavoriteTasks: Task[] = []

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
          favoritesCount={0}
        />

        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks">
            <DashboardTabs
              todayTasks={sortedTodayTasks}
              favoriteTasks={sortedFavoriteTasks}
              highPriorityTasks={sortedHighPriorityTasks}
              allTasks={sortedAllTasks}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="space-y-4">
              <Tabs defaultValue="week" className="w-full" onValueChange={(value) => setCompletedPeriod(value as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="month">This Month</TabsTrigger>
                  <TabsTrigger value="year">This Year</TabsTrigger>
                </TabsList>
                
                <CompletedTasksStats period={completedPeriod} />
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
      </div>
    </AppLayout>
  );
}
