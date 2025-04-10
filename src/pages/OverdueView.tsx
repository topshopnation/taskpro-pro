
import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { Task } from "@/components/tasks/TaskItem"
import { Button } from "@/components/ui/button"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { TaskList } from "@/components/tasks/TaskList"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useTaskRealtime } from "@/hooks/useTaskRealtime";
import { TooltipProvider } from "@/components/ui/tooltip"
import { sortTasks, groupTasks } from "@/utils/overdueTaskUtils"
import { OverdueHeader } from "@/components/overdue/OverdueHeader"
import { EmptyOverdueState } from "@/components/overdue/EmptyOverdueState"
import { RescheduleDialog } from "@/components/overdue/RescheduleDialog"
import { 
  ArrowDownAZ, 
  ArrowUpZA, 
  Layers 
} from "lucide-react"

export default function OverdueView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const { user } = useAuth()

  const fetchOverdueTasks = useCallback(async () => {
    if (!user) return []
    
    const todayDate = new Date()
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name, color)')
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('due_date', todayDate.toISOString())
        
      if (error) throw error
      
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        notes: task.notes,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        priority: task.priority || 4,
        projectId: task.project_id,
        projectName: task.projects?.name || 'No Project',
        projectColor: task.projects?.color,
        section: task.section,
        completed: task.completed || false,
        favorite: task.favorite || false
      }))
    } catch (error: any) {
      toast.error("Failed to fetch overdue tasks", {
        description: error.message
      })
      return []
    }
  }, [user])
  
  const { isLoading } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: fetchOverdueTasks,
    enabled: !!user
  })
  
  useEffect(() => {
    if (!user) return;
    
    const fetchAndSetTasks = async () => {
      try {
        const fetchedTasks = await fetchOverdueTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching overdue tasks:", error);
      }
    };
    
    fetchAndSetTasks();
  }, [user, fetchOverdueTasks]);

  useTaskRealtime(user, () => {
    fetchOverdueTasks()
      .then(updatedTasks => {
        setTasks(updatedTasks);
      })
      .catch(error => {
        console.error("Error in real-time update:", error);
      });
  });

  const handleComplete = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId)
        
      if (error) throw error
      
      toast.success(completed ? "Task completed" : "Task uncompleted")
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        
      if (error) throw error
      
      toast.success("Task deleted")
    } catch (error: any) {
      toast.error("Failed to delete task", {
        description: error.message
      })
    }
  }

  const handleFavoriteToggle = async (taskId: string, favorite: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ favorite })
        .eq('id', taskId)
        
      if (error) throw error
    } catch (error: any) {
      toast.error("Failed to update task", {
        description: error.message
      })
    }
  }

  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection)

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <OverdueHeader 
            onRescheduleClick={() => setIsRescheduleOpen(true)} 
            taskCount={tasks.length}
          />

          <div className="flex items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {sortDirection === "asc" 
                    ? <ArrowDownAZ className="h-4 w-4" /> 
                    : <ArrowUpZA className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("asc"); }}>
                  Sort by Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("title"); setSortDirection("desc"); }}>
                  Sort by Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("asc"); }}>
                  Sort by Due Date (Earliest)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("dueDate"); setSortDirection("desc"); }}>
                  Sort by Due Date (Latest)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("asc"); }}>
                  Sort by Project (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy("project"); setSortDirection("desc"); }}>
                  Sort by Project (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Layers className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setGroupBy(null)}>
                  No Grouping
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGroupBy("title")}>
                  Group by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("project")}>
                  Group by Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("dueDate")}>
                  Group by Due Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-6">
            {Object.keys(groupedTasks).length === 0 ? (
              <EmptyOverdueState onAddTaskClick={() => setIsCreateTaskOpen(true)} />
            ) : (
              Object.entries(groupedTasks).map(([group, groupTasks]) => (
                <TaskList
                  key={group}
                  title={groupBy ? group : ""}
                  tasks={groupTasks}
                  isLoading={isLoading}
                  emptyMessage="No tasks in this group"
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))
            )}
          </div>

          <CreateTaskDialog
            open={isCreateTaskOpen}
            onOpenChange={setIsCreateTaskOpen}
          />

          <RescheduleDialog
            open={isRescheduleOpen}
            onOpenChange={setIsRescheduleOpen}
            tasks={tasks}
            onSuccess={() => {
              fetchOverdueTasks().then(updatedTasks => {
                setTasks(updatedTasks);
              });
            }}
          />
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}
