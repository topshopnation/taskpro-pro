
import { TaskList } from "@/components/tasks/TaskList"
import { Task } from "@/components/tasks/TaskItem"

interface ProjectSectionsProps {
  unsectionedTasks: Task[]
  sections: { id: string; name: string }[]
  getSectionTasks: (sectionId: string) => Task[]
  handleComplete: (taskId: string, completed: boolean) => void
  handleDelete: (taskId: string) => void
  handleFavoriteToggle: (taskId: string, favorite: boolean) => void
}

export function ProjectSections({
  unsectionedTasks,
  sections,
  getSectionTasks,
  handleComplete,
  handleDelete,
  handleFavoriteToggle
}: ProjectSectionsProps) {
  return (
    <div className="space-y-6">
      {/* Unsectioned tasks */}
      {unsectionedTasks.length > 0 && (
        <div className="mb-8">
          <TaskList
            title={sections.length > 0 ? "Unsectioned Tasks" : "Tasks"}
            tasks={unsectionedTasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </div>
      )}

      {/* Sections */}
      {sections.map(section => (
        <div key={section.id} className="mb-8">
          <TaskList
            title={section.name}
            tasks={getSectionTasks(section.id)}
            emptyMessage={`No tasks in ${section.name}`}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onFavoriteToggle={handleFavoriteToggle}
          />
        </div>
      ))}
    </div>
  )
}
