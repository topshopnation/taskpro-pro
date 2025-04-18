
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, Search, RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { UserActivity } from "@/types/adminTypes";

// Mock data for user activity
const mockUserActivity: UserActivity[] = [
  {
    id: "1",
    user_id: "user123",
    email: "john@example.com",
    action: "login",
    details: "User logged in from IP 192.168.1.1",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 minutes ago
  },
  {
    id: "2",
    user_id: "user456",
    email: "jane@example.com",
    action: "upgrade",
    details: "Upgraded to Pro Monthly plan",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: "3",
    user_id: "user789",
    email: "bob@example.com",
    action: "create_project",
    details: "Created project 'Marketing Campaign'",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "4",
    user_id: "user123",
    email: "john@example.com",
    action: "update_profile",
    details: "Updated user profile information",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: "5",
    user_id: "user456",
    email: "jane@example.com",
    action: "error",
    details: "Failed login attempt",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
];

// Generate more mock data
for (let i = 6; i <= 20; i++) {
  const randomUser = ["user123", "user456", "user789"][Math.floor(Math.random() * 3)];
  const randomEmail = ["john@example.com", "jane@example.com", "bob@example.com"][Math.floor(Math.random() * 3)];
  const randomAction = ["login", "logout", "create_task", "complete_task", "error", "upgrade"][Math.floor(Math.random() * 6)];
  const randomDaysAgo = Math.floor(Math.random() * 30) + 1;
  
  mockUserActivity.push({
    id: i.toString(),
    user_id: randomUser,
    email: randomEmail,
    action: randomAction,
    details: `${randomAction} action details`,
    timestamp: new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString()
  });
}

export default function ActivityAdmin() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    // Simulate API call
    const fetchActivities = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setActivities(mockUserActivity);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  // Apply filters
  const filteredActivities = activities
    .filter(activity => 
      (activity.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
       activity.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
       activity.action.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (actionFilter === "all" || activity.action === actionFilter)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Paginate
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setActivities(mockUserActivity);
      setLoading(false);
    }, 500);
  };
  
  // Function to format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    
    const minutes = Math.floor(diff / 1000 / 60);
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}d ago`;
    }
    
    return format(time, "MMM dd, yyyy");
  };
  
  // Function to get badge for activity type
  const getActionBadge = (action: string) => {
    switch (action) {
      case "login":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-300">Login</Badge>;
      case "logout":
        return <Badge variant="outline" className="border-gray-300">Logout</Badge>;
      case "upgrade":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-300">Upgrade</Badge>;
      case "create_project":
      case "create_task":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-300">Create</Badge>;
      case "complete_task":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-300">Complete</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };
  
  // Actions dropdown options
  const actionOptions = [
    { value: "all", label: "All Actions" },
    { value: "login", label: "Login" },
    { value: "logout", label: "Logout" },
    { value: "upgrade", label: "Upgrade" },
    { value: "create_task", label: "Create Task" },
    { value: "create_project", label: "Create Project" },
    { value: "complete_task", label: "Complete Task" },
    { value: "error", label: "Error" },
  ];
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            View user activity and system events
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Recent user activities and system events
          </CardDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search activity logs..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedActivities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No activity logs found that match your filters.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="font-medium">{activity.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {activity.user_id}</div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(activity.action)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{activity.details}</div>
                      </TableCell>
                      <TableCell>
                        <div className="whitespace-nowrap">{formatRelativeTime(activity.timestamp)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), "MMM dd, yyyy HH:mm")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(filteredActivities.length, (page - 1) * itemsPerPage + 1)} to {Math.min(filteredActivities.length, page * itemsPerPage)} of {filteredActivities.length} entries
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
