
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { TimeFilter } from "@/components/completed-tasks/TimeFilter"
import { TasksByProject } from "@/components/completed-tasks/TasksByProject"
import { ProjectLoadingState } from "@/components/projects/ProjectLoadingState"
import { useCompletedTasks } from "@/hooks/useCompletedTasks"

export default function CompletedTasks() {
  const [timeFilter, setTimeFilter] = useState("all")
  const { 
    tasksByProject, 
    isLoading, 
    handleComplete, 
    handleDelete
  } = useCompletedTasks(timeFilter)

  const getProjectName = (projectId: string): string => {
    // In a real app, you'd fetch this from the database
    const projectNames: Record<string, string> = {
      "inbox": "Inbox",
      "work": "Work",
      "personal": "Personal",
      "none": "No Project"
    }
    return projectNames[projectId] || projectId
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Completed Tasks</h1>
          <div className="flex items-center gap-2">
            <TimeFilter value={timeFilter} onChange={setTimeFilter} />
          </div>
        </div>

        {isLoading ? (
          <ProjectLoadingState isLoading={true} projectExists={true} />
        ) : (
          <TasksByProject
            tasksByProject={tasksByProject}
            getProjectName={getProjectName}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppLayout>
  )
}
