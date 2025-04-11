
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar/SidebarContent";
import { useState } from "react";
import { TaskProLogo } from "@/components/ui/taskpro-logo";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b bg-background px-3 md:px-6 shadow-sm">
      <div className="flex items-center gap-1 md:gap-2">
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent onMobileMenuClose={() => setShowSidebar(false)} />
          </SheetContent>
        </Sheet>
        <TaskProLogo size="small" withText className="ml-1" />
      </div>
      <div className="flex items-center">
        <Avatar 
          className="cursor-pointer h-9 w-9 md:h-10 md:w-10"
          onClick={() => navigate("/settings")} 
        >
          <AvatarImage src={user?.avatarUrl || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground flex items-center justify-center text-sm">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
