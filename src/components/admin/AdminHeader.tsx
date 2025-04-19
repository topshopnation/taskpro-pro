
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { BellIcon, LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminHeaderProps {
  adminEmail: string | null;
}

export function AdminHeader({ adminEmail }: AdminHeaderProps) {
  const navigate = useNavigate();
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!adminEmail) return 'A';
    return adminEmail.charAt(0).toUpperCase();
  };

  const handleAdminLogout = () => {
    // Clear admin session
    localStorage.removeItem('admin_session');
    toast.success("Signed out of admin portal");
    navigate('/admin/login');
  };

  return (
    <header className="flex h-16 items-center border-b px-6">
      <div className="mr-auto font-semibold text-lg">
        Admin Dashboard
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="rounded-full">
          <BellIcon className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <span className="text-sm text-muted-foreground mr-2">
          {adminEmail}
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar-placeholder.png" alt="Admin" />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAdminLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
