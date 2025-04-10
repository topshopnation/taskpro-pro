
import { useMemo } from "react";
import { Task } from "@/components/tasks/TaskItem";
import { format, subDays, subMonths, subYears, isWithinInterval } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompletedTasksStatsProps {
  tasks: Task[];
}

export function CompletedTasksStats({ tasks }: CompletedTasksStatsProps) {
  // Filter tasks to only include completed ones
  const completedTasks = tasks.filter(task => task.completed);
  
  // Prepare data for different time periods
  const weeklyData = useMemo(() => {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    
    // Initialize data for each of the last 7 days
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      return {
        date: format(date, 'EEE'),
        count: 0,
        fullDate: date
      };
    }).reverse();
    
    // Count tasks completed on each day
    completedTasks.forEach(task => {
      if (task.dueDate && isWithinInterval(task.dueDate, { start: weekAgo, end: today })) {
        const taskDate = format(task.dueDate, 'EEE');
        const dataPoint = data.find(d => d.date === taskDate);
        if (dataPoint) {
          dataPoint.count += 1;
        }
      }
    });
    
    return data;
  }, [completedTasks]);
  
  const monthlyData = useMemo(() => {
    const today = new Date();
    const monthAgo = subDays(today, 30);
    
    // Group by week
    const data = [
      { date: 'Week 1', count: 0 },
      { date: 'Week 2', count: 0 },
      { date: 'Week 3', count: 0 },
      { date: 'Week 4', count: 0 },
    ];
    
    // Count tasks completed in each week
    completedTasks.forEach(task => {
      if (task.dueDate && isWithinInterval(task.dueDate, { start: monthAgo, end: today })) {
        const daysAgo = Math.floor((today.getTime() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysAgo / 7), 3);
        data[weekIndex].count += 1;
      }
    });
    
    return data;
  }, [completedTasks]);
  
  const yearlyData = useMemo(() => {
    const today = new Date();
    const yearAgo = subYears(today, 1);
    
    // Group by month
    const data = Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(today, i);
      return {
        date: format(date, 'MMM'),
        count: 0,
      };
    }).reverse();
    
    // Count tasks completed in each month
    completedTasks.forEach(task => {
      if (task.dueDate && isWithinInterval(task.dueDate, { start: yearAgo, end: today })) {
        const taskMonth = format(task.dueDate, 'MMM');
        const dataPoint = data.find(d => d.date === taskMonth);
        if (dataPoint) {
          dataPoint.count += 1;
        }
      }
    });
    
    return data;
  }, [completedTasks]);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Completed Tasks</h2>
      
      <Tabs defaultValue="week" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Last Week</TabsTrigger>
          <TabsTrigger value="month">Last Month</TabsTrigger>
          <TabsTrigger value="year">Last Year</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks (Last 7 Days)</CardTitle>
              <CardDescription>
                Number of tasks completed each day over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} tasks`, 'Completed']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Bar dataKey="count" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks (Last 30 Days)</CardTitle>
              <CardDescription>
                Number of tasks completed each week over the past month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} tasks`, 'Completed']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="count" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="year" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks (Last Year)</CardTitle>
              <CardDescription>
                Number of tasks completed each month over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} tasks`, 'Completed']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Bar dataKey="count" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
