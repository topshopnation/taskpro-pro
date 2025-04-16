
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { AdminStats } from "@/types/adminTypes";
import { BarChart, LineChart } from "@/components/ui/chart";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Users as UsersIcon,
  UserMinus,
  UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 0,
    active_subscriptions: 0,
    trial_users: 0,
    expired_subscriptions: 0,
    revenue_monthly: 0,
    revenue_yearly: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // For demo purposes, we'll set dummy data
        // In a real application, fetch this from your database
        const { data: totalUsers } = await supabase
          .from('profiles')
          .select('count');
          
        const { data: activeSubscriptions } = await supabase
          .from('subscriptions')
          .select('count')
          .eq('status', 'active');
          
        const { data: trialUsers } = await supabase
          .from('subscriptions')
          .select('count')
          .eq('status', 'trial');
          
        const { data: expiredSubscriptions } = await supabase
          .from('subscriptions')
          .select('count')
          .eq('status', 'expired');
        
        setStats({
          total_users: totalUsers?.[0]?.count || 0,
          active_subscriptions: activeSubscriptions?.[0]?.count || 0,
          trial_users: trialUsers?.[0]?.count || 0,
          expired_subscriptions: expiredSubscriptions?.[0]?.count || 0,
          revenue_monthly: activeSubscriptions?.[0]?.count * 3 || 0,
          revenue_yearly: activeSubscriptions?.[0]?.count * 30 || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const userBarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [12, 19, 3, 5, 2, 3, 8, 14, 10, 15, 9, 11]
      },
      {
        label: 'Active Subscriptions',
        data: [8, 12, 5, 8, 9, 13, 15, 22, 24, 28, 32, 36]
      }
    ]
  };

  const revenueLineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [65, 95, 115, 140, 180, 210, 250, 310, 350, 410, 450, 520]
      }
    ]
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                Across all subscription types
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
              <p className="text-xs text-muted-foreground">
                Paying customers
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue_monthly}</div>
              <p className="text-xs text-muted-foreground">
                Current month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue_yearly}</div>
              <p className="text-xs text-muted-foreground">
                Current year
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart data={userBarChartData} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <LineChart data={revenueLineChartData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
