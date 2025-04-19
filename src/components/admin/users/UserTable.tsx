
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserCog, CreditCard, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { UserProfile } from "@/types/adminTypes";

interface UserTableProps {
  users: UserProfile[];
  onRoleChange: (user: UserProfile) => void;
  onEditUser?: (user: UserProfile) => void;
  onEditSubscription?: (user: UserProfile) => void;
}

export function UserTable({ users, onRoleChange, onEditUser, onEditSubscription }: UserTableProps) {
  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "trial":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Trial</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return <Badge className="bg-purple-600">Admin</Badge>;
      case "support":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Support</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getUserInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {getUserInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.first_name || ''} {user.last_name || ''}</div>
                    <div className="text-sm text-muted-foreground">{user.email || 'No email'}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getSubscriptionBadge(user.subscription_status || 'none')}
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.plan_type
                      ? `${user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)} plan`
                      : 'No plan'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.role || 'user')}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(user.last_login)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Joined {formatDate(user.created_at)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onEditUser && (
                      <DropdownMenuItem onClick={() => onEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onRoleChange(user)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Change Role
                    </DropdownMenuItem>
                    {onEditSubscription && (
                      <DropdownMenuItem onClick={() => onEditSubscription(user)}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Edit Subscription
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <UserCheck className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
