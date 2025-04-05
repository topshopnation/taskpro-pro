
import { Task } from "@/components/tasks/TaskItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface DashboardChartsProps {
  tasks: Task[];
}

export function DashboardCharts({ tasks }: DashboardChartsProps) {
  // Generate weekly stats based on completed tasks
  const generateWeeklyStats = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    const stats = days.map((name, index) => {
      // Calculate date for this day of the week
      const date = new Date(today);
      const diff = index - dayOfWeek;
      date.setDate(date.getDate() + diff);
      
      // Count completed tasks for this day
      const completedCount = tasks.filter(task => {
        if (!task.completed) return false;
        const taskDate = new Date(task.dueDate || '');
        return (
          taskDate.getDate() === date.getDate() &&
          taskDate.getMonth() === date.getMonth() &&
          taskDate.getFullYear() === date.getFullYear()
        );
      }).length;
      
      return { name, completed: completedCount };
    });
    
    return stats;
  };

  // Generate project stats based on task completion
  const generateProjectStats = () => {
    // Group tasks by project
    const projectTaskMap: Record<string, { completed: number, total: number, name: string }> = {};
    
    tasks.forEach(task => {
      const projectId = task.projectId || 'Inbox';
      
      if (!projectTaskMap[projectId]) {
        projectTaskMap[projectId] = { completed: 0, total: 0, name: projectId };
      }
      
      projectTaskMap[projectId].total++;
      
      if (task.completed) {
        projectTaskMap[projectId].completed++;
      }
    });
    
    return Object.values(projectTaskMap);
  };

  const stats = generateWeeklyStats();
  const projectStats = generateProjectStats();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tasks Completed This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Tasks Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectStats}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
