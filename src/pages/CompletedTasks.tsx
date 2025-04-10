
import { useCompletedTasks } from "@/hooks/useCompletedTasks";
import { TasksByProject } from "@/components/completed-tasks/TasksByProject";
import { AppLayout } from "@/components/layout/AppLayout";
import { TimeFilter } from "@/components/completed-tasks/TimeFilter";
import { useState } from "react";
import { ProjectLoadingState } from "@/components/projects/ProjectLoadingState";

export default function CompletedTasks() {
  const [timeFilter, setTimeFilter] = useState("all");
  const { 
    tasksByProject, 
    isLoading, 
    handleComplete, 
    handleDelete
  } = useCompletedTasks(timeFilter);

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
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppLayout>
  );
}
