
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { useProject } from "@/hooks/useProject"
import { useProjectTasks } from "@/hooks/useProjectTasks"
import { ProjectHeader } from "@/components/projects/ProjectHeader"
import { ProjectDialogs } from "@/components/projects/ProjectDialogs"
import { ProjectLoadingState } from "@/components/projects/ProjectLoadingState"
import { ProjectSections } from "@/components/projects/ProjectSections"

export default function ProjectView() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")

  // Use custom hooks for project data and tasks
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
    handleProjectFavoriteToggle,
    handleProjectRename,
    handleProjectDelete
  } = useProject()

  const {
    isLoadingTasks,
    unsectionedTasks,
    sections,
    getSectionTasks,
    handleComplete,
    handleDelete,
    handleFavoriteToggle
  } = useProjectTasks(id)

  const isLoading = isLoadingProject || isLoadingTasks

  return (
    <AppLayout>
      <ProjectLoadingState 
        isLoading={isLoading} 
        projectExists={!!currentProject} 
      />
      
      {!isLoading && currentProject && (
        <div className="space-y-6">
          <ProjectHeader 
            projectName={currentProject.name}
            isFavorite={currentProject.favorite}
            onFavoriteToggle={handleProjectFavoriteToggle}
            onCreateTask={() => setIsCreateTaskOpen(true)}
            onCreateSection={() => setIsCreateSectionOpen(true)}
            onEditProject={() => {
              setNewProjectName(currentProject.name)
              setIsEditProjectOpen(true)
            }}
            onDeleteProject={() => setIsDeleteProjectOpen(true)}
          />

          <ProjectSections 
            unsectionedTasks={unsectionedTasks}
            sections={sections}
            getSectionTasks={getSectionTasks}
            handleComplete={handleComplete}
            handleDelete={handleDelete}
            handleFavoriteToggle={handleFavoriteToggle}
          />

          <ProjectDialogs 
            projectId={id}
            isCreateTaskOpen={isCreateTaskOpen}
            setIsCreateTaskOpen={setIsCreateTaskOpen}
            isEditProjectOpen={isEditProjectOpen}
            setIsEditProjectOpen={setIsEditProjectOpen}
            isDeleteProjectOpen={isDeleteProjectOpen}
            setIsDeleteProjectOpen={setIsDeleteProjectOpen}
            isCreateSectionOpen={isCreateSectionOpen}
            setIsCreateSectionOpen={setIsCreateSectionOpen}
            newSectionName={newSectionName}
            setNewSectionName={setNewSectionName}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            handleProjectRename={handleProjectRename}
            handleProjectDelete={handleProjectDelete}
          />
        </div>
      )}
    </AppLayout>
  )
}
