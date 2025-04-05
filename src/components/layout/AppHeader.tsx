
import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plus, Menu } from "lucide-react"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"

interface AppHeaderProps {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

export default function AppHeader({ isMobileMenuOpen, setIsMobileMenuOpen }: AppHeaderProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)

  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          <h1 className="text-xl font-bold">TaskPro</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCreateTaskOpen(true)}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </Button>
          <ThemeToggle />
        </div>
        <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
      </div>
    </header>
  )
}
