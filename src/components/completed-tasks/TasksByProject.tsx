
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"

interface TasksByProjectProps {
  tasksByProject: Record<string, Task[]>
  getProjectName: (projectId: string) => string
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onFavoriteToggle: (taskId: string, favorite: boolean) => void
}

export function TasksByProject({
  tasksByProject,
  getProjectName,
  onComplete,
  onDelete,
  onFavoriteToggle
}: TasksByProjectProps) {
  if (Object.keys(tasksByProject).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No completed tasks found</p>
      </div>
    )
  }

  return (
    <>
      {Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
        <div key={projectId} className="mb-8">
          <TaskList
            title={getProjectName(projectId)}
            tasks={projectTasks}
            onComplete={onComplete}
            onDelete={onDelete}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      ))}
    </>
  )
}
