
import { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAuth } from "@/hooks/use-auth"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { useOverdueTasks } from "@/hooks/useOverdueTasks"
import { useTaskOperations } from "@/hooks/useTaskOperations"
import { OverdueHeader } from "@/components/overdue/OverdueHeader"
import { SortGroupControls } from "@/components/overdue/SortGroupControls"
import { RescheduleDialog } from "@/components/overdue/RescheduleDialog"
import { EmptyOverdueState } from "@/components/overdue/EmptyOverdueState"
import { sortTasks, groupTasks } from "@/utils/overdueTaskUtils"
import { TaskList } from "@/components/tasks/TaskList"
import { useTaskRealtime } from "@/hooks/useTaskRealtime"

export default function OverdueView() {
  // State management
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  
  // Hooks
  const { user } = useAuth()
  const { data: tasks = [], isLoading, refetch } = useOverdueTasks(user?.id)
  const { handleComplete, handleDelete, handleFavoriteToggle } = useTaskOperations()
  
  // Set up realtime subscription - make refetch return a Promise
  useTaskRealtime(user, async () => {
    if (user) {
      await refetch();
    }
  });

  // Handlers
  const handleRescheduleAllClick = () => {
    setIsRescheduleOpen(true)
  }

  const handleSortChange = (newSortBy: string, newDirection: "asc" | "desc") => {
    setSortBy(newSortBy)
    setSortDirection(newDirection)
  }

  // Process tasks
  const groupedTasks = groupTasks(tasks, groupBy, sortBy, sortDirection)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with Reschedule button */}
        <div className="flex items-center justify-between">
          <OverdueHeader 
            onRescheduleClick={handleRescheduleAllClick}
            taskCount={tasks.length}
          />
          <SortGroupControls 
            sortBy={sortBy}
            sortDirection={sortDirection}
            groupBy={groupBy}
            onSortChange={handleSortChange}
            onGroupChange={setGroupBy}
          />
        </div>

        {/* Task lists */}
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
                hideTitle={!groupBy}
              />
            ))
          )}
        </div>

        {/* Dialogs */}
        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
        />
        
        <RescheduleDialog
          open={isRescheduleOpen}
          onOpenChange={setIsRescheduleOpen}
          tasks={tasks}
          onSuccess={refetch}
        />
      </div>
    </AppLayout>
  );
}
