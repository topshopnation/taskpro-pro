import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminRole, UserProfile } from "@/types/adminTypes";
import { toast } from "sonner";
import { UserSearch } from "@/components/admin/users/UserSearch";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserRoleDialog } from "@/components/admin/users/UserRoleDialog";
import { UserPagination } from "@/components/admin/users/UserPagination";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";
import { EditSubscriptionDialog } from "@/components/admin/users/EditSubscriptionDialog";
import { supabase } from "@/integrations/supabase/client";

export default function UsersAdmin() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const itemsPerPage = 10;
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles with email and role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get subscriptions separately
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Match subscriptions to profiles
      const formattedUsers: UserProfile[] = profiles.map(profile => {
        const userSubscription = subscriptions.find(sub => sub.user_id === profile.id) || {
          status: 'none',
          plan_type: 'none'
        };
        
        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          subscription_status: userSubscription.status,
          plan_type: userSubscription.plan_type,
          role: profile.role || 'user',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_login: profile.updated_at // Using updated_at as fallback for last_login
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = page * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const handleRefresh = () => {
    fetchUsers();
  };
  
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      // Update the user in the database if they're an admin
      const { error } = await supabase
        .from('admin_users')
        .upsert({
          id: selectedUser.id,
          email: selectedUser.email || '',
          role: newRole,
          password_hash: 'placeholder', // Would be set properly in a real scenario
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id ? { ...user, role: newRole } : user
        )
      );
      
      toast.success(`Updated ${selectedUser.email} role to ${newRole}`);
      setShowRoleDialog(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            View and manage user accounts
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and access permissions
          </CardDescription>
          <UserSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No users found.</p>
            </div>
          ) : (
            <>
              <UserTable 
                users={paginatedUsers} 
                onRoleChange={(user) => {
                  setSelectedUser(user);
                  setNewRole(user.role as AdminRole || 'admin');
                  setShowRoleDialog(true);
                }}
                onEditUser={(user) => {
                  setSelectedUser(user);
                  setShowEditUserDialog(true);
                }}
                onEditSubscription={(user) => {
                  setSelectedUser(user);
                  setShowSubscriptionDialog(true);
                }}
              />
              
              <UserPagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                startIdx={startIdx}
                endIdx={endIdx}
                totalItems={filteredUsers.length}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      <UserRoleDialog
        isOpen={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        selectedUser={selectedUser}
        newRole={newRole}
        setNewRole={setNewRole}
        onUpdate={handleRoleChange}
      />
      
      <EditUserDialog 
        open={showEditUserDialog}
        onOpenChange={setShowEditUserDialog}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
      
      <EditSubscriptionDialog 
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </AdminLayout>
  );
}
