
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import { ProjectHeader } from "@/components/projects/ProjectHeader"
import { ProjectDialogs } from "@/components/projects/ProjectDialogs"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { ProjectLoadingState } from "@/components/projects/ProjectLoadingState"
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { TaskSortControls } from "@/components/tasks/TaskSortControls"
import { GroupedTaskLists } from "@/components/tasks/GroupedTaskLists"
import { groupTasks } from "@/utils/taskSortUtils"

export default function ProjectView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("title")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<string | null>(null)

  const {
    id,
    currentProject,
    isLoadingProject,
    isEditProjectOpen,
    setIsEditProjectOpen,
    isDeleteProjectOpen,
    setIsDeleteProjectOpen,
    newProjectName,
    setNewProjectName,
    projectColor,
    setProjectColor,
    handleProjectFavoriteToggle,
    handleProjectRename,
    handleProjectDelete,
    handleProjectColorChange
  } = useProject()

  const {
    tasks,
    isLoadingTasks,
    unsectionedTasks,
    handleComplete,
    handleDelete
  } = useProjectTasks(id)

  useEffect(() => {
    if (currentProject) {
      setNewProjectName(currentProject.name)
      setProjectColor(currentProject.color || "")
    }
  }, [currentProject, setNewProjectName, setProjectColor])

  const groupedTasks = groupTasks(unsectionedTasks, groupBy, sortBy, sortDirection)

  if (isLoadingProject) {
    return <ProjectLoadingState isLoading={true} projectExists={true} />
  }

  if (!currentProject) {
    return <ProjectLoadingState isLoading={false} projectExists={false} />
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <ProjectHeader
            name={currentProject.name}
            favorite={currentProject.favorite}
            color={currentProject.color}
            onFavoriteToggle={handleProjectFavoriteToggle}
            onRenameClick={() => {
              setNewProjectName(currentProject.name)
              setProjectColor(currentProject.color || "")
              setIsEditProjectOpen(true)
            }}
            onDeleteClick={() => setIsDeleteProjectOpen(true)}
            onColorChange={handleProjectColorChange}
          />

          <TaskSortControls
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            onAddTask={() => setIsCreateTaskOpen(true)}
            hideAddTaskButton={true}
          />
        </div>

        <GroupedTaskLists
          groupedTasks={groupedTasks}
          groupBy={groupBy}
          isLoadingTasks={isLoadingTasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onAddTask={() => setIsCreateTaskOpen(true)}
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultProjectId={id}
        />

        {isEditProjectOpen && (
          <ProjectDialogs
            projectId={id}
            isCreateTaskOpen={isCreateTaskOpen}
            setIsCreateTaskOpen={setIsCreateTaskOpen}
            isEditProjectOpen={isEditProjectOpen}
            setIsEditProjectOpen={setIsEditProjectOpen}
            isDeleteProjectOpen={isDeleteProjectOpen}
            setIsDeleteProjectOpen={setIsDeleteProjectOpen}
            isCreateSectionOpen={false}
            setIsCreateSectionOpen={() => {}}
            newSectionName=""
            setNewSectionName={() => {}}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            handleProjectRename={handleProjectRename}
            handleProjectDelete={handleProjectDelete}
          />
        )}
      </div>
    </AppLayout>
  )
}
