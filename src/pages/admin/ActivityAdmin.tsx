
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, UserCheck, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminService } from "@/services/admin-service";

type ActivityLog = {
  type: 'auth' | 'profile' | 'subscription';
  timestamp: string;
  details: any;
};

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
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  const getEventDescription = (log: ActivityLog) => {
    switch (log.type) {
      case 'auth':
        return `Auth event: ${log.details.event_type || 'Unknown'}`;
      case 'profile':
        return `Profile updated: ${log.details.first_name || ''} ${log.details.last_name || ''} (${log.details.email || 'No email'})`;
      case 'subscription':
        return `Subscription changed to: ${log.details.status} (${log.details.plan_type} plan)`;
      default:
        return 'Unknown event';
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Track user activities and system events
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Recent system events and user activities
          </CardDescription>
          <Tabs defaultValue="all" className="mt-3" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="profile">Profile Updates</TabsTrigger>
              <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
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
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        {getEventIcon(log.type)}
                        <span className="ml-2">{getEventTypeBadge(log.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getEventDescription(log)}</TableCell>
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
