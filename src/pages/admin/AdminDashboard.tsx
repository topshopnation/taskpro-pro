
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpRight, Users, CreditCard, Activity, DollarSign, RefreshCw, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { adminService } from "@/services/admin";
import { DashboardStats } from "@/services/admin/dashboard-stats-service";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    active_subscriptions: 0,
    trial_users: 0,
    expired_subscriptions: 0,
    total_tasks: 0,
    total_projects: 0,
    revenue_monthly: 0,
    revenue_yearly: 0
  });
  const [loading, setLoading] = useState(true);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Mock data for charts - in real app this would come from the database
  const revenueData = [
    { month: 'Jan', revenue: stats.revenue_monthly * 0.8 },
    { month: 'Feb', revenue: stats.revenue_monthly * 0.9 },
    { month: 'Mar', revenue: stats.revenue_monthly * 1.1 },
    { month: 'Apr', revenue: stats.revenue_monthly * 1.0 },
    { month: 'May', revenue: stats.revenue_monthly * 1.2 },
    { month: 'Jun', revenue: stats.revenue_monthly },
  ];

  const userData = [
    { month: 'Jan', users: Math.max(0, stats.total_users - 50) },
    { month: 'Feb', users: Math.max(0, stats.total_users - 40) },
    { month: 'Mar', users: Math.max(0, stats.total_users - 30) },
    { month: 'Apr', users: Math.max(0, stats.total_users - 20) },
    { month: 'May', users: Math.max(0, stats.total_users - 10) },
    { month: 'Jun', users: stats.total_users },
  ];
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system metrics and performance
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Users"
          value={stats.total_users}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Total registered users"
          trend={stats.total_users > 0 ? "+12% from last month" : "No users yet"}
          loading={loading}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.active_subscriptions}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          description="Current paid subscribers"
          trend={stats.active_subscriptions > 0 ? "+8% from last month" : "No active subscriptions"}
          loading={loading}
        />
        <StatsCard
          title="Trial Users"
          value={stats.trial_users}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          description="Users in trial period"
          trend={stats.trial_users > 0 ? "+5% from last month" : "No trial users"}
          loading={loading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.revenue_monthly.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Revenue from monthly plans"
          trend={stats.revenue_monthly > 0 ? "+15% from last month" : "$0 revenue"}
          loading={loading}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="Total Tasks"
          value={stats.total_tasks}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="Tasks created by users"
          trend={stats.total_tasks > 0 ? "Productive users" : "No tasks yet"}
          loading={loading}
        />
        <StatsCard
          title="Total Projects"
          value={stats.total_projects}
          icon={<Database className="h-4 w-4 text-muted-foreground" />}
          description="Projects created by users"
          trend={stats.total_projects > 0 ? "Active organization" : "No projects yet"}
          loading={loading}
        />
        <StatsCard
          title="Yearly Revenue"
          value={`$${stats.revenue_yearly.toFixed(2)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Revenue from yearly plans"
          trend={stats.revenue_yearly > 0 ? "Annual subscribers" : "$0 yearly revenue"}
          loading={loading}
        />
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue trend (simulated data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full w-full bg-muted/20 animate-pulse rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                User growth over time (simulated data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="h-full w-full bg-muted/20 animate-pulse rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

// Stats Card Component
function StatsCard({ title, value, description, icon, trend, loading }: { 
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-1/2 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              {trend}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
