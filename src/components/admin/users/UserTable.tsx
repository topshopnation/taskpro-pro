
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserCog, CreditCard, Edit, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { UserProfile } from "@/types/adminTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { updateSubscriptionStatus } from "@/contexts/subscription/utils";
import { Subscription, SubscriptionStatus, SubscriptionPlanType } from "@/contexts/subscription/types";

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

  // Calculate expiration date and days remaining
  const getExpirationInfo = (user: UserProfile) => {
    // Create a mock subscription object to use with updateSubscriptionStatus
    const mockSubscription: Subscription | null = user.subscription_status ? {
      id: '',
      user_id: user.id,
      status: user.subscription_status as SubscriptionStatus,
      plan_type: (user.plan_type || 'monthly') as SubscriptionPlanType,
      trial_start_date: null,
      trial_end_date: user.trial_end_date || null,
      current_period_start: null,
      current_period_end: user.current_period_end || null,
      paypal_subscription_id: null,
      created_at: '',
      updated_at: ''
    } : null;
    
    const { isActive, isTrialActive, daysRemaining } = updateSubscriptionStatus(mockSubscription);
    
    let expirationDate = user.current_period_end || user.trial_end_date;
    let expirationDateFormatted = expirationDate ? formatDate(expirationDate) : 'N/A';
    
    let statusText = isActive 
      ? `Active (${daysRemaining} days left)` 
      : isTrialActive 
        ? `Trial (${daysRemaining} days left)` 
        : 'Expired';
    
    return { expirationDateFormatted, statusText, daysRemaining, isActive, isTrialActive };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const { expirationDateFormatted, statusText, daysRemaining, isActive, isTrialActive } = getExpirationInfo(user);
            
            return (
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={`text-sm ${!isActive && !isTrialActive ? 'text-destructive' : ''}`}>
                            {statusText}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Expires on: {expirationDateFormatted}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
