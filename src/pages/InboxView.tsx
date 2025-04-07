
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth"
import { useInboxTasks } from "@/hooks/useInboxTasks"
import { TaskList } from "@/components/tasks/TaskList"
import { Button } from "@/components/ui/button"
import { Plus, Inbox } from "lucide-react"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"

export default function InboxView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const { user } = useAuth()
  const { tasks, isLoading, handleComplete, handleDelete, handleFavoriteToggle } = useInboxTasks()

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Inbox className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Inbox</h1>
          </div>
          <Button 
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          emptyMessage="No tasks in inbox. Add a task to get started!"
          onComplete={handleComplete}
          onDelete={handleDelete}
          onFavoriteToggle={handleFavoriteToggle}
          title="Inbox Tasks"
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
