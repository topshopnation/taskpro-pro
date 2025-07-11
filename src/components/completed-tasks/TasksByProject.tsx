import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/taskTypes"

interface TasksByProjectProps {
  tasksByProject: Record<string, Task[]>
  onComplete: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
}

export function TasksByProject({
  tasksByProject,
  onComplete,
  onDelete
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
      {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
        <div key={projectName} className="mb-8">
          <TaskList
            title={projectName}
            tasks={projectTasks}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        </div>
      ))}
    </>
  )
}
