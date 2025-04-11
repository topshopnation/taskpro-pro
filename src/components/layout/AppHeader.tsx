
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskProLogo } from "@/components/ui/taskpro-logo";
import { SearchDialog } from "@/components/search/SearchDialog";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

export function AppHeader() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebar = useSidebar();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Skip rendering the header on auth and index pages
  const isAuthPage = location.pathname === "/auth" || location.pathname.startsWith("/auth/");
  const isIndexPage = location.pathname === "/";
  
  if (isAuthPage || isIndexPage) {
    return null;
  }
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {isMobile && (
            <Button
              variant="ghost"
              className="mr-2"
              size="icon"
              onClick={() => sidebar.toggleMobileSidebar()}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
          
          <div className="flex items-center">
            <TaskProLogo />
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <SubscriptionStatus />
            
            <Button
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search tasks</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  {user?.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.firstName || user.email || "User"} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
