
import { TaskList } from "@/components/tasks/TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/components/tasks/TaskItem";
import { DashboardCharts } from "./DashboardCharts";

interface DashboardTabsProps {
  todayTasks: Task[];
  favoriteTasks: Task[];
  highPriorityTasks: Task[];
  allTasks: Task[];
  onComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void;
}

export function DashboardTabs({
  todayTasks,
  favoriteTasks,
  highPriorityTasks,
  allTasks,
  onComplete,
  onDelete,
  onFavoriteToggle
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList>
        <TabsTrigger value="today">Today</TabsTrigger>
        <TabsTrigger value="favorites">Favorites</TabsTrigger>
        <TabsTrigger value="highPriority">High Priority</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <TaskList
          title="Tasks Due Today"
          tasks={todayTasks}
          emptyMessage="No tasks due today"
          onComplete={onComplete}
          onDelete={onDelete}
        />
      </TabsContent>
      <TabsContent value="favorites">
        <TaskList
          title="Favorite Tasks"
          tasks={favoriteTasks}
          emptyMessage="No favorite tasks"
          onComplete={onComplete}
          onDelete={onDelete}
        />
      </TabsContent>
      <TabsContent value="highPriority">
        <TaskList
          title="High Priority Tasks"
          tasks={highPriorityTasks}
          emptyMessage="No high priority tasks"
          onComplete={onComplete}
          onDelete={onDelete}
        />
      </TabsContent>
      <TabsContent value="stats">
        <DashboardCharts tasks={allTasks} />
      </TabsContent>
    </Tabs>
  );
}
