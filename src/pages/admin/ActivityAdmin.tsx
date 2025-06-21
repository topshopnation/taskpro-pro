
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, UserCheck, CreditCard, FileText, Folder } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminService } from "@/services/admin";
import { ActivityLog } from "@/services/admin/activity-logs-service";

export default function ActivityAdmin() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const logs = await adminService.getActivityLogs();
      setActivityLogs(logs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);
  
  const handleRefresh = () => {
    fetchActivityLogs();
  };
  
  const filteredLogs = activeTab === "all" 
    ? activityLogs 
    : activityLogs.filter(log => log.type === activeTab);
  
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM dd, yyyy HH:mm:ss");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'auth':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Authentication</Badge>;
      case 'profile':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Profile</Badge>;
      case 'subscription':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Subscription</Badge>;
      case 'task':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Task</Badge>;
      case 'project':
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">Project</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'profile':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      case 'subscription':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'task':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'project':
        return <Folder className="h-4 w-4 text-cyan-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityStats = () => {
    const total = activityLogs.length;
    const byType = activityLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byType };
  };

  const stats = getActivityStats();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Track user activities and system events ({stats.total} total activities)
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.byType.auth || 0}</div>
            <p className="text-xs text-muted-foreground">Authentication</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.byType.subscription || 0}</div>
            <p className="text-xs text-muted-foreground">Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.byType.task || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.byType.project || 0}</div>
            <p className="text-xs text-muted-foreground">Projects</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Recent system events and user activities
          </CardDescription>
          <Tabs defaultValue="all" className="mt-3" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Events ({stats.total})</TabsTrigger>
              <TabsTrigger value="auth">Authentication ({stats.byType.auth || 0})</TabsTrigger>
              <TabsTrigger value="subscription">Subscriptions ({stats.byType.subscription || 0})</TabsTrigger>
              <TabsTrigger value="task">Tasks ({stats.byType.task || 0})</TabsTrigger>
              <TabsTrigger value="project">Projects ({stats.byType.project || 0})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No activity logs found.</p>
              {activeTab !== "all" && <p className="text-sm mt-2">Try switching to "All Events" or check a different category.</p>}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getEventIcon(log.type)}
                        <span className="ml-2">{getEventTypeBadge(log.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.details.task_title && `Task: ${log.details.task_title}`}
                          {log.details.project_name && `Project: ${log.details.project_name}`}
                          {log.details.status && `Status: ${log.details.status}`}
                          {log.details.plan_type && `Plan: ${log.details.plan_type}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.user_email || 'Unknown User'}
                      </div>
                    </TableCell>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
