
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, UserCog, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status: string;
  subscription_type: string;
  last_sign_in: string | null;
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Join users with their subscription information
      const { data, error } = await supabase
        .from('auth.users')
        .select(`
          id,
          email,
          created_at,
          last_sign_in_at,
          subscriptions (
            status,
            plan_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format data for our UI
      const formattedUsers = data?.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        subscription_status: user.subscriptions?.status || 'none',
        subscription_type: user.subscriptions?.plan_type || 'none',
        last_sign_in: user.last_sign_in_at
      })) || [];
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: selectedUser.subscription_status,
          plan_type: selectedUser.subscription_type
        })
        .eq('user_id', selectedUser.id);
        
      if (error) throw error;
      
      toast.success('User updated successfully');
      setUserDetailsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by email..."
                className="w-[250px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="none">No Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Plan Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No users found with the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {user.last_sign_in 
                        ? format(new Date(user.last_sign_in), 'MMM d, yyyy') 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.subscription_status === 'active' ? 'default' : 
                          user.subscription_status === 'trial' ? 'secondary' :
                          'outline'
                        }
                      >
                        {user.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.subscription_type}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="text-sm font-medium">{selectedUser.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="text-sm font-medium">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedUser.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Sign In</Label>
                    <p className="text-sm font-medium">
                      {selectedUser.last_sign_in 
                        ? format(new Date(selectedUser.last_sign_in), 'MMM d, yyyy') 
                        : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Subscription Status</Label>
                  <Select 
                    value={selectedUser.subscription_status}
                    onValueChange={(value) => 
                      setSelectedUser({...selectedUser, subscription_status: value})
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="plan_type">Plan Type</Label>
                  <Select 
                    value={selectedUser.subscription_type}
                    onValueChange={(value) => 
                      setSelectedUser({...selectedUser, subscription_type: value})
                    }
                  >
                    <SelectTrigger id="plan_type">
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserDetailsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
