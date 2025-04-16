
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Download, RefreshCw } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  email: string;
  action: string;
  details: string;
  created_at: string;
}

export default function ActivityAdmin() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setIsLoading(true);
      
      // In a production environment, you would have an activity_logs table
      // Here we'll generate dummy data for demonstration
      const dummyLogs: ActivityLog[] = [
        {
          id: '1',
          user_id: 'user-123',
          email: 'user1@example.com',
          action: 'login',
          details: 'User logged in successfully',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user-456',
          email: 'user2@example.com',
          action: 'subscription_created',
          details: 'User subscribed to monthly plan',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          user_id: 'user-789',
          email: 'user3@example.com',
          action: 'task_created',
          details: 'User created a new task',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          user_id: 'user-123',
          email: 'user1@example.com',
          action: 'project_created',
          details: 'User created a new project',
          created_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          user_id: 'user-456',
          email: 'user2@example.com',
          action: 'password_reset',
          details: 'User requested password reset',
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      
      setLogs(dummyLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = () => {
    try {
      // Create CSV content
      const csvContent = [
        ['ID', 'User ID', 'Email', 'Action', 'Details', 'Timestamp'].join(','),
        ...logs.map(log => [
          log.id,
          log.user_id,
          log.email,
          log.action,
          `"${log.details.replace(/"/g, '""')}"`,
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const filteredLogs = logs.filter(log => 
    log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'login':
        return 'default';
      case 'subscription_created':
        return 'success';
      case 'password_reset':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search logs..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchActivityLogs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleExportLogs}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No activity logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
