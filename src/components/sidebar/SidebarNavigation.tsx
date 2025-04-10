
import { Home, Inbox, CalendarClock, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  onMobileMenuClose: () => void;
}

export function SidebarNavigation({ onMobileMenuClose }: SidebarNavigationProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Inbox className="h-4 w-4" />
                <span>Inbox</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/today"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <CalendarClock className="h-4 w-4" />
                <span>Today</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/overdue"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Clock className="h-4 w-4" />
                <span>Overdue</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
