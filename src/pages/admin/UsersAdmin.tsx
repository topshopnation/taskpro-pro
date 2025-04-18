import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminRole } from "@/types/adminTypes";
import { toast } from "sonner";
import { UserSearch } from "@/components/admin/users/UserSearch";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserRoleDialog } from "@/components/admin/users/UserRoleDialog";
import { UserPagination } from "@/components/admin/users/UserPagination";

const sampleUsers = [
  {
    id: "user123",
    email: "johndoe@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    subscription_status: "active",
    plan_type: "monthly",
    last_login: new Date().toISOString(),
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user456",
    email: "janedoe@example.com",
    firstName: "Jane",
    lastName: "Doe",
    role: "user",
    subscription_status: "trial",
    plan_type: "monthly",
    last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user789",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    subscription_status: "active",
    plan_type: "yearly",
    last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user101",
    email: "support@example.com",
    firstName: "Support",
    lastName: "Team",
    role: "support",
    subscription_status: "active",
    plan_type: "yearly",
    last_login: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function UsersAdmin() {
  const [users, setUsers] = useState(sampleUsers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>("admin");
  const itemsPerPage = 10;
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(sampleUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = page * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIdx, endIdx);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  
  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
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
                  setNewRole(user.role as AdminRole);
                  setShowRoleDialog(true);
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
    </AdminLayout>
  );
}
