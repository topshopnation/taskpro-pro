import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminStats } from "@/types/adminTypes";
import { Users, CreditCard, UserPlus, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";

const revenueData = [
  { name: "Jan", monthly: 420, yearly: 1200 },
  { name: "Feb", monthly: 450, yearly: 1250 },
  { name: "Mar", monthly: 480, yearly: 1300 },
  { name: "Apr", monthly: 520, yearly: 1400 },
  { name: "May", monthly: 550, yearly: 1450 },
  { name: "Jun", monthly: 590, yearly: 1500 },
  { name: "Jul", monthly: 620, yearly: 1550 },
  { name: "Aug", monthly: 650, yearly: 1600 },
  { name: "Sep", monthly: 680, yearly: 1650 },
  { name: "Oct", monthly: 710, yearly: 1700 },
  { name: "Nov", monthly: 750, yearly: 1750 },
  { name: "Dec", monthly: 790, yearly: 1800 }
];

const userGrowthData = [
  { name: "Jan", users: 112 },
  { name: "Feb", users: 145 },
  { name: "Mar", users: 189 },
  { name: "Apr", users: 256 },
  { name: "May", users: 345 },
  { name: "Jun", users: 443 },
  { name: "Jul", users: 529 },
  { name: "Aug", users: 602 },
  { name: "Sep", users: 689 },
  { name: "Oct", users: 754 },
  { name: "Nov", users: 823 },
  { name: "Dec", users: 915 }
];

const subscriptionsData = [
  { name: "Jan", active: 95, trial: 25, expired: 15 },
  { name: "Feb", active: 100, trial: 30, expired: 18 },
  { name: "Mar", active: 110, trial: 35, expired: 20 },
  { name: "Apr", active: 120, trial: 40, expired: 22 },
  { name: "May", active: 130, trial: 45, expired: 25 },
  { name: "Jun", active: 140, trial: 50, expired: 28 },
  { name: "Jul", active: 150, trial: 55, expired: 32 },
  { name: "Aug", active: 160, trial: 60, expired: 35 },
  { name: "Sep", active: 170, trial: 65, expired: 38 },
  { name: "Oct", active: 180, trial: 70, expired: 42 },
  { name: "Nov", active: 190, trial: 75, expired: 45 },
  { name: "Dec", active: 200, trial: 80, expired: 48 }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    total_users: 915,
    active_subscriptions: 200,
    trial_users: 80,
    expired_subscriptions: 48,
    revenue_monthly: 2370,
    revenue_yearly: 5400
  });
  
  const [timeRange, setTimeRange] = useState("year");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          total_users: 915,
          active_subscriptions: 200,
          trial_users: 80,
          expired_subscriptions: 48,
          revenue_monthly: 2370,
          revenue_yearly: 5400
        });
      } catch (error) {
        console.error("Error loading admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [timeRange]);
  
  const getTimeRangeData = (data: any[]) => {
    if (timeRange === "month") {
      return data.slice(-3);
    } else if (timeRange === "quarter") {
      return data.slice(-3);
    } else {
      return data;
    }
  };
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of subscription status and user activity
          </p>
        </div>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_subscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" />
                8%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trial_users}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" />
                15%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue_monthly + stats.revenue_yearly}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-green-500 flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3" />
                10%
              </span> 
              from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly vs. Yearly subscription revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTimeRangeData(revenueData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                    <Legend />
                    <Bar dataKey="monthly" name="Monthly Plans" fill="#8884d8" />
                    <Bar dataKey="yearly" name="Yearly Plans" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>
                User registration over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTimeRangeData(userGrowthData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" name="Total Users" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Active, trial, and expired subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTimeRangeData(subscriptionsData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" name="Active" fill="#82ca9d" />
                    <Bar dataKey="trial" name="Trial" fill="#8884d8" />
                    <Bar dataKey="expired" name="Expired" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
