
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"
import { Button } from "@/components/ui/button"

interface GroupedTaskListsProps {
  groupedTasks: Record<string, Task[]>
  groupBy: string | null
  isLoadingTasks: boolean
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onAddTask: () => void
  hideTitle?: boolean
  onFavoriteToggle?: (taskId: string, favorite: boolean) => void
}

export function GroupedTaskLists({
  groupedTasks,
  groupBy,
  isLoadingTasks,
  onComplete,
  onDelete,
  onAddTask,
  hideTitle = false,
  onFavoriteToggle
}: GroupedTaskListsProps) {
  if (Object.keys(groupedTasks).length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No tasks in this project</h3>
        <p className="text-muted-foreground mb-4">Add a task to get started!</p>
        <Button onClick={onAddTask}>Add a Task</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTasks).map(([group, groupTasks]) => (
        <TaskList
          key={group}
          title={hideTitle ? "" : (groupBy ? group : "Project Tasks")}
          tasks={groupTasks}
          isLoading={isLoadingTasks}
          emptyMessage="No tasks in this group"
          onComplete={onComplete}
          onDelete={onDelete}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  )
}
