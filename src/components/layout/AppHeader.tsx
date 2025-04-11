
import { AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar/sidebar-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { useEffect, useState } from "react";

export function AppHeader({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const auth = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState({
    name: auth.user?.firstName || "User",
    imageUrl: auth.user?.avatarUrl
  });
  
  useEffect(() => {
    setUserProfile({
      name: auth.user?.firstName || "User",
      imageUrl: auth.user?.avatarUrl
    });
  }, [auth.user]);

  return (
    <header className={cn("border-b bg-background", className)} {...props}>
      <div className="flex h-16 items-center px-4 md:px-6">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:hidden"
            onClick={() => toggleSidebar()}
          >
            <AlignLeft className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        
        <div className="flex-1"></div>
        
        <SubscriptionStatus />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                <AvatarFallback>{userProfile.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => auth.signOut()}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
