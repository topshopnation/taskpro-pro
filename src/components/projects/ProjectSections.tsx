import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/taskTypes"

interface ProjectSectionsProps {
  tasks: Task[]
  handleComplete: (taskId: string, completed: boolean) => void
  handleDelete: (taskId: string) => void
  isLoading?: boolean
  hideTitle?: boolean
}

export function ProjectSections({
  tasks,
  handleComplete,
  handleDelete,
  isLoading = false,
  hideTitle = false
}: ProjectSectionsProps) {
  return (
    <div className="space-y-6">
      <TaskList
        title={hideTitle ? "" : "Project Tasks"}
        tasks={tasks.filter(task => !task.completed)}
        isLoading={isLoading}
        emptyMessage="No tasks in this project"
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    </div>
  )
}
