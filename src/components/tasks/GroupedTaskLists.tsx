
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
  onTaskEdit?: (task: Task) => void
  onPriorityChange?: (taskId: string, priority: 1 | 2 | 3 | 4) => void
  onDateChange?: (taskId: string, date: Date | undefined) => void
}

export function GroupedTaskLists({
  groupedTasks,
  groupBy,
  isLoadingTasks,
  onComplete,
  onDelete,
  onAddTask,
  hideTitle = false,
  onFavoriteToggle,
  onTaskEdit,
  onPriorityChange,
  onDateChange
}: GroupedTaskListsProps) {
  if (Object.keys(groupedTasks).length === 0) {
    return (
      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <h3 className="text-base md:text-lg font-medium mb-2">No tasks in this project</h3>
        <p className="text-muted-foreground text-sm mb-4">Add a task to get started!</p>
        <Button onClick={onAddTask} size="sm">Add a Task</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
          onTaskEdit={onTaskEdit}
          onPriorityChange={onPriorityChange}
          onDateChange={onDateChange}
        />
      ))}
    </div>
  )
}
