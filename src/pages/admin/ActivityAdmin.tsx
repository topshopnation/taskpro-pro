
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  AlertTriangle, 
  Settings, 
  LogIn, 
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserActivity } from "@/types/adminTypes";
import { format } from "date-fns";

// Sample data for activity logs
const sampleActivities: UserActivity[] = [
  {
    id: "1",
    user_id: "user123",
    email: "user@example.com",
    action: "login",
    details: "User logged in successfully",
    timestamp: new Date().toISOString()
  },
  {
    id: "2",
    user_id: "user456",
    email: "anotheruser@example.com",
    action: "subscription_updated",
    details: "Changed from monthly to yearly plan",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "3",
    user_id: "user789",
    email: "thirduser@example.com",
    action: "task_created",
    details: "Created new task 'Review project proposal'",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "4",
    user_id: "user123",
    email: "user@example.com",
    action: "logout",
    details: "User logged out",
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "5",
    user_id: "user456",
    email: "anotheruser@example.com",
    action: "payment_failed",
    details: "Monthly subscription payment failed",
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
];

// Activity action to badge variant mapping
const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case "login":
    case "register":
      return "default";
    case "logout":
      return "secondary";
    case "payment_failed":
    case "subscription_cancelled":
      return "destructive";
    case "subscription_updated":
    case "subscription_created":
    case "task_created":
    case "project_created":
      return "outline";
    default:
      return "secondary";
  }
};

// Activity action to icon mapping
const getActionIcon = (action: string) => {
  switch (action) {
    case "login":
      return <LogIn className="h-4 w-4" />;
    case "logout":
      return <LogOut className="h-4 w-4" />;
    case "payment_failed":
    case "subscription_cancelled":
      return <AlertTriangle className="h-4 w-4" />;
    case "subscription_updated":
    case "subscription_created":
      return <Settings className="h-4 w-4" />;
    case "task_viewed":
    case "project_viewed":
      return <Eye className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function ActivityAdmin() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    // In a real implementation, this would fetch data from Supabase
    // For now, we'll use the sample data
    const loadActivities = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setActivities(sampleActivities);
      } catch (error) {
        console.error("Error loading activity logs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, []);
  
  // Filter activities based on search and action type
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = filter === "" || 
      activity.email.toLowerCase().includes(filter.toLowerCase()) ||
      activity.details.toLowerCase().includes(filter.toLowerCase());
      
    const matchesAction = actionFilter === "" || activity.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });
  
  // Paginate activities
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = page * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  
  // Get unique action types for filter dropdown
  const actionTypes = Array.from(new Set(activities.map(a => a.action)));
  
  const refreshActivities = () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setActivities(sampleActivities);
      setLoading(false);
    }, 500);
  };
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">
            Monitor user activities and system events
          </p>
        </div>
        <Button onClick={refreshActivities} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View detailed logs of user actions and system events
          </CardDescription>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by email or details..." 
                className="pl-10"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0 w-full sm:w-48">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No activity logs found.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center cursor-pointer">
                          Time
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center cursor-pointer">
                          User
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {activity.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getActionBadgeVariant(activity.action)} 
                            className="flex items-center gap-1 w-fit"
                          >
                            {getActionIcon(activity.action)}
                            {activity.action.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {activity.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredActivities.length, startIdx + 1)} to {Math.min(filteredActivities.length, endIdx)} of {filteredActivities.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
