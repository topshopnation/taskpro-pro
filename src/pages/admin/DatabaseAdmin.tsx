
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Table, Users, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TableInfo {
  table_name: string;
  row_count: number;
}

export default function DatabaseAdmin() {
  const [tableStats, setTableStats] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true);
      
      const stats: TableInfo[] = [];
      
      // Fetch count for each table explicitly to avoid TypeScript issues
      try {
        const { count: profilesCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'profiles', row_count: profilesCount || 0 });
      } catch (err) {
        console.error('Error fetching profiles count:', err);
        stats.push({ table_name: 'profiles', row_count: 0 });
      }

      try {
        const { count: subscriptionsCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'subscriptions', row_count: subscriptionsCount || 0 });
      } catch (err) {
        console.error('Error fetching subscriptions count:', err);
        stats.push({ table_name: 'subscriptions', row_count: 0 });
      }

      try {
        const { count: plansCount } = await supabase
          .from('subscription_plans')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'subscription_plans', row_count: plansCount || 0 });
      } catch (err) {
        console.error('Error fetching subscription_plans count:', err);
        stats.push({ table_name: 'subscription_plans', row_count: 0 });
      }

      try {
        const { count: adminCount } = await supabase
          .from('admin_users')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'admin_users', row_count: adminCount || 0 });
      } catch (err) {
        console.error('Error fetching admin_users count:', err);
        stats.push({ table_name: 'admin_users', row_count: 0 });
      }

      try {
        const { count: tasksCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'tasks', row_count: tasksCount || 0 });
      } catch (err) {
        console.error('Error fetching tasks count:', err);
        stats.push({ table_name: 'tasks', row_count: 0 });
      }

      try {
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'projects', row_count: projectsCount || 0 });
      } catch (err) {
        console.error('Error fetching projects count:', err);
        stats.push({ table_name: 'projects', row_count: 0 });
      }

      try {
        const { count: filtersCount } = await supabase
          .from('filters')
          .select('*', { count: 'exact', head: true });
        stats.push({ table_name: 'filters', row_count: filtersCount || 0 });
      } catch (err) {
        console.error('Error fetching filters count:', err);
        stats.push({ table_name: 'filters', row_count: 0 });
      }
      
      setTableStats(stats);
    } catch (error) {
      console.error("Error fetching database stats:", error);
      toast.error("Failed to load database statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'profiles':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'subscriptions':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'subscription_plans':
        return <Table className="h-5 w-5 text-purple-500" />;
      case 'admin_users':
        return <Users className="h-5 w-5 text-red-500" />;
      case 'tasks':
        return <Table className="h-5 w-5 text-orange-500" />;
      case 'projects':
        return <Table className="h-5 w-5 text-cyan-500" />;
      case 'filters':
        return <Table className="h-5 w-5 text-pink-500" />;
      default:
        return <Table className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTableName = (tableName: string) => {
    return tableName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Database Management</h1>
          <p className="text-muted-foreground">
            Monitor database tables and statistics
          </p>
        </div>
        <Button onClick={fetchDatabaseStats} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tableStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Main application tables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Table className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tableStats.reduce((sum, table) => sum + table.row_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tables
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Table Statistics</CardTitle>
          <CardDescription>
            Row counts for each database table
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tableStats.map((table) => (
                <div key={table.table_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTableIcon(table.table_name)}
                    <div>
                      <h3 className="font-medium">{formatTableName(table.table_name)}</h3>
                      <p className="text-sm text-muted-foreground">{table.table_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{table.row_count}</div>
                    <p className="text-xs text-muted-foreground">records</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
