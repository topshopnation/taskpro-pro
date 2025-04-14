
import { Search, Inbox, CalendarClock, Clock, BarChart2, Plus, ListTodo, Filter } from "lucide-react";
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
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors 
                transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setIsSearchOpen(true);
                onMobileMenuClose();
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors 
                transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/inbox"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname === '/inbox'
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Inbox</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/today"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname === '/today'
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <CalendarClock className="h-3.5 w-3.5" />
                <span>Today</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/overdue"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname === '/overdue'
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Overdue</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname.startsWith('/projects')
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <ListTodo className="h-3.5 w-3.5" />
                <span>Projects</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/filters"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname.startsWith('/filters')
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors ${
                    isActive || location.pathname === '/stats'
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_2px_5px_rgba(0,0,0,0.08)]" 
                      : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`
                }
                onClick={onMobileMenuClose}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Statistics</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
      
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
    </SidebarGroup>
  );
}
