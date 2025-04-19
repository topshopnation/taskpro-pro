
import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth-context"
import { useInboxTasks } from "@/hooks/useInboxTasks"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { Inbox } from "lucide-react"
import { TaskSortControls } from "@/components/tasks/TaskSortControls"
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists"
import { groupTasks } from "@/utils/taskSortUtils"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { SubscriptionRestriction } from "@/components/subscription/SubscriptionRestriction"

export default function InboxView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const { user } = useAuth()
  const { tasks, isLoading, handleComplete, handleDelete, refetch } = useInboxTasks()

  // Group tasks based on the current settings
  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection)

  // Handle project change
  const handleProjectChange = async (taskId: string, projectId: string | null) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ project_id: projectId })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Refetch tasks to update the list
      refetch();
      
      toast.success(projectId ? "Task moved to project" : "Task moved to inbox");
    } catch (error: any) {
      toast.error(`Error changing project: ${error.message}`);
    }
  };

  return (
    <AppLayout>
      <SubscriptionRestriction>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              <h1 className="text-2xl font-bold">Inbox</h1>
            </div>
            
            <TaskSortControls
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              hideAddTaskButton={true}
            />
          </div>

          {/* Display grouped tasks */}
          <GroupedTaskLists
            groupedTasks={groupedTasks}
            groupBy={groupBy}
            isLoadingTasks={isLoading}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onAddTask={() => setIsCreateTaskOpen(true)}
            hideTitle={!groupBy}
            onProjectChange={handleProjectChange}
          />

          <CreateTaskDialog
            open={isCreateTaskOpen}
            onOpenChange={setIsCreateTaskOpen}
            defaultProjectId="inbox"
          />
        </div>
      </SubscriptionRestriction>
    </AppLayout>
  );
}
