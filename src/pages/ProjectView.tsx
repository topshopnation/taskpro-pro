
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" 
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
  const navigate = useNavigate()
  const { id, name } = useParams();

  const {
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
  } = useProject();

  // Update URL if project name changes
  useEffect(() => {
    if (currentProject && !isLoadingProject) {
      const currentSlug = name;
      const newSlug = currentProject.name.toLowerCase().replace(/\s+/g, '-');
      
      if (currentSlug !== newSlug) {
        navigate(`/projects/${id}/${newSlug}`, { replace: true });
      }
    }
  }, [currentProject, id, name, navigate, isLoadingProject]);

  const {
    tasks,
    isLoadingTasks,
    unsectionedTasks,
    handleComplete,
    handleDelete
  } = useProjectTasks(id);

  useEffect(() => {
    if (currentProject) {
      setNewProjectName(currentProject.name);
      setProjectColor(currentProject.color || "");
    }
  }, [currentProject, setNewProjectName, setProjectColor]);

  const groupedTasks = groupTasks(unsectionedTasks, groupBy, sortBy, sortDirection);

  if (isLoadingProject) {
    return <ProjectLoadingState isLoading={true} projectExists={true} />;
  }

  if (!currentProject) {
    return <ProjectLoadingState isLoading={false} projectExists={false} />;
  }

  const projectColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  // Redirect to Today page instead of Home after project deletion
  const handleProjectDeleteWithRedirect = async () => {
    await handleProjectDelete();
    navigate('/today');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
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
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <TaskSortControls
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            hideAddTaskButton={true}
          />
          
          <Button 
            size="sm" 
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>

        <GroupedTaskLists
          groupedTasks={groupedTasks}
          groupBy={groupBy}
          isLoadingTasks={isLoadingTasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onAddTask={() => setIsCreateTaskOpen(true)}
          hideTitle={!groupBy}
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onOpenChange={setIsCreateTaskOpen}
          defaultProjectId={id}
        />

        <ProjectDialogs
          projectId={id || ''}
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
          projectColor={projectColor}
          setProjectColor={setProjectColor}
          projectColors={projectColors}
          handleProjectRename={handleProjectRename}
          handleProjectDelete={handleProjectDeleteWithRedirect}
        />
      </div>
    </AppLayout>
  );
}
