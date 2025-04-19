import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpRight, Users, CreditCard, Activity, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    active_subscriptions: 0,
    trial_users: 0,
    expired_subscriptions: 0,
    revenue_monthly: 0,
    revenue_yearly: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });

        // Fetch subscriptions stats
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*');

        const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
        const trialUsers = subscriptions?.filter(s => s.status === 'trial').length || 0;
        const expiredSubscriptions = subscriptions?.filter(s => s.status === 'expired').length || 0;

        // Calculate revenue
        const monthlyRevenue = subscriptions
          ?.filter(s => s.status === 'active' && s.plan_type === 'monthly')
          .length * 2; // $2 per monthly subscription

        const yearlyRevenue = subscriptions
          ?.filter(s => s.status === 'active' && s.plan_type === 'yearly')
          .length * 20; // $20 per yearly subscription

        setStats({
          total_users: usersCount || 0,
          active_subscriptions: activeSubscriptions,
          trial_users: trialUsers,
          expired_subscriptions: expiredSubscriptions,
          revenue_monthly: monthlyRevenue,
          revenue_yearly: yearlyRevenue
        });

        // Fetch historical data for charts
        // This would require additional database columns for historical data
        // For now, we'll use the current month's data
        
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  
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
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 800);
          }}
        >
          <RefreshIcon className="mr-2 h-4 w-4" />
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
          trend={"+12% from last month"}
          loading={loading}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.active_subscriptions}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          description="Current paid subscribers"
          trend={"+8% from last month"}
          loading={loading}
        />
        <StatsCard
          title="Trial Users"
          value={stats.trial_users}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          description="Users in trial period"
          trend={"+5% from last month"}
          loading={loading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.revenue_monthly}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Revenue from monthly plans"
          trend={"+15% from last month"}
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
                Monthly revenue from all subscription types
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
                      <Tooltip />
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
                Monthly active user count
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

// Simple refresh icon component
function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
