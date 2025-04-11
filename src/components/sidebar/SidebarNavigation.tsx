
import { Search, Inbox, CalendarClock, Clock, BarChart2, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";

interface SidebarNavigationProps {
  onMobileMenuClose: () => void;
}

export function SidebarNavigation({ onMobileMenuClose }: SidebarNavigationProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setIsCreateTaskOpen(true);
                onMobileMenuClose();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors 
                transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setIsSearchOpen(true);
                onMobileMenuClose();
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors 
                transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
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
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Statistics</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
    </SidebarGroup>
  )
}
