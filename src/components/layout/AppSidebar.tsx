
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  LayoutGrid, 
  Filter, 
  Star, 
  Settings, 
  Plus, 
  ChevronRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useState } from "react"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog"

// Mock data - replace with real data from Supabase
const favoriteItems = [
  { id: "inbox", name: "Inbox", type: "project", icon: ListTodo },
  { id: "today", name: "Today", type: "filter", icon: Filter },
]

const projects = [
  { id: "inbox", name: "Inbox", icon: ListTodo },
  { id: "work", name: "Work", icon: ListTodo },
  { id: "personal", name: "Personal", icon: ListTodo },
]

const filters = [
  { id: "today", name: "Today", icon: Filter },
  { id: "upcoming", name: "Upcoming", icon: Filter },
  { id: "priority1", name: "Priority 1", icon: Filter },
]

interface AppSidebarProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export default function AppSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AppSidebarProps) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false)

  const SidebarContent = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Favorites Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Favorites</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoriteItems.map((item) => (
                <SidebarMenuItem key={`fav-${item.id}`}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.type === "project" ? `/projects/${item.id}` : `/filters/${item.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <Star className="h-3 w-3 ml-auto text-yellow-400 fill-yellow-400" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Nav Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/completed"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Completed</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between mb-2">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateProjectOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Project</span>
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/projects/${project.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <project.icon className="h-4 w-4" />
                      <span>{project.name}</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Filters Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between mb-2">
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateFilterOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add Filter</span>
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {filters.map((filter) => (
                <SidebarMenuItem key={filter.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/filters/${filter.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <filter.icon className="h-4 w-4" />
                      <span>{filter.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "transparent hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
      
      <CreateProjectDialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
      <CreateFilterDialog open={isCreateFilterOpen} onOpenChange={setIsCreateFilterOpen} />
    </ScrollArea>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:block border-r">
        <SidebarContent />
      </Sidebar>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
