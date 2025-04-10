
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <TaskProLogo size="small" />
      </div>
      <div className="flex items-center">
        <Avatar 
          className="cursor-pointer"
          onClick={() => navigate("/settings")} 
        >
          <AvatarImage src={user?.avatarUrl || ""} />
          <AvatarFallback className="bg-primary text-primary-foreground flex items-center justify-center">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
