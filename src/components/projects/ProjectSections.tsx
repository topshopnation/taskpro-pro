
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"

interface ProjectSectionsProps {
  tasks: Task[]
  handleComplete: (taskId: string, completed: boolean) => void
  handleDelete: (taskId: string) => void
  isLoading?: boolean
}

export function ProjectSections({
  tasks,
  handleComplete,
  handleDelete,
  isLoading = false
}: ProjectSectionsProps) {
  return (
    <div className="space-y-6">
      <TaskList
        title="Project Tasks"
        tasks={tasks.filter(task => !task.completed)}
        isLoading={isLoading}
        emptyMessage="No tasks in this project"
        onComplete={handleComplete}
        onDelete={handleDelete}
      />
    </div>
  )
}
