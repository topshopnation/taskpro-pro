
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth"
import { useInboxTasks } from "@/hooks/useInboxTasks"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { Inbox } from "lucide-react"
import { TaskSortControls } from "@/components/tasks/TaskSortControls"
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists"
import { groupTasks } from "@/utils/taskSortUtils"

export default function InboxView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const { user } = useAuth()
  const { tasks, isLoading, handleComplete, handleDelete } = useInboxTasks()

  // Group tasks based on the current settings
  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Inbox className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Inbox</h1>
          </div>
          
          <TaskSortControls
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            onAddTask={() => setIsCreateTaskOpen(true)}
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
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultProjectId="inbox"
        />
      </div>
    </AppLayout>
  )
}
