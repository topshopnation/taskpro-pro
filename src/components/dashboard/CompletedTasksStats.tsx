
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompletedTasksStatsProps {
  period?: 'week' | 'month' | 'year';
}

export function CompletedTasksStats({ period = 'week' }: CompletedTasksStatsProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>(period);
  const { user } = useAuth();

  const getPeriodBounds = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
          format: 'EEE', // Mon, Tue, etc.
          days: 7
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          format: 'd MMM', // 1 Jan, 2 Jan, etc.
          days: 30
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          format: 'MMM', // Jan, Feb, etc.
          days: 12
        };
    }
  };

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        const periodBounds = getPeriodBounds();
        
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('completed, completion_date')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('completion_date', periodBounds.start.toISOString())
          .lte('completion_date', periodBounds.end.toISOString());
          
        if (error) throw error;
        
        // Process data for visualization based on period
        let processedData: any[] = [];
        
        if (selectedPeriod === 'week') {
          // Group by day of week
          const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
            const day = new Date();
            day.setDate(day.getDate() - day.getDay() + i + (i === 0 ? -6 : 1)); // Start from Monday
            return {
              name: format(day, 'EEE'),
              date: format(day, 'yyyy-MM-dd'),
              count: 0
            };
          });
          
          // Count tasks completed on each day
          tasks?.forEach(task => {
            if (task.completion_date) {
              const completedDate = format(new Date(task.completion_date), 'yyyy-MM-dd');
              const dayIndex = daysOfWeek.findIndex(day => day.date === completedDate);
              if (dayIndex !== -1) {
                daysOfWeek[dayIndex].count++;
              }
            }
          });
          
          processedData = daysOfWeek;
        } else if (selectedPeriod === 'month') {
          // Group by week or days depending on the current month
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          
          const daysData = Array.from({ length: daysInMonth }, (_, i) => {
            const day = new Date(today.getFullYear(), today.getMonth(), i + 1);
            return {
              name: format(day, 'd'),
              date: format(day, 'yyyy-MM-dd'),
              count: 0
            };
          });
          
          tasks?.forEach(task => {
            if (task.completion_date) {
              const completedDate = format(new Date(task.completion_date), 'yyyy-MM-dd');
              const dayIndex = daysData.findIndex(day => day.date === completedDate);
              if (dayIndex !== -1) {
                daysData[dayIndex].count++;
              }
            }
          });
          
          // Group by weeks for better visualization
          const weeksData = [];
          for (let i = 0; i < daysInMonth; i += 7) {
            const week = daysData.slice(i, i + 7);
            const weekTotal = week.reduce((sum, day) => sum + day.count, 0);
            const startDay = i + 1;
            const endDay = Math.min(i + 7, daysInMonth);
            weeksData.push({
              name: `${startDay}-${endDay}`,
              count: weekTotal
            });
          }
          
          processedData = weeksData;
        } else if (selectedPeriod === 'year') {
          // Group by month
          const monthsData = Array.from({ length: 12 }, (_, i) => {
            const month = new Date(new Date().getFullYear(), i, 1);
            return {
              name: format(month, 'MMM'),
              month: i,
              count: 0
            };
          });
          
          tasks?.forEach(task => {
            if (task.completion_date) {
              const completedMonth = new Date(task.completion_date).getMonth();
              monthsData[completedMonth].count++;
            }
          });
          
          processedData = monthsData;
        }
        
        setData(processedData);
      } catch (error) {
        console.error('Error fetching completed tasks stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompletedTasks();
  }, [user, selectedPeriod]);

  const getChartTitle = () => {
    switch (selectedPeriod) {
      case 'week':
        return 'Tasks Completed This Week';
      case 'month':
        return 'Tasks Completed This Month';
      case 'year':
        return 'Tasks Completed This Year';
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={selectedPeriod} 
          onValueChange={(value) => setSelectedPeriod(value as 'week' | 'month' | 'year')}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Completed Tasks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
