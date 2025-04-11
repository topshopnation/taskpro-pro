
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectOption } from "@/components/tasks/taskTypes"
import { useTaskProjects } from "@/components/tasks/useTaskProjects"
import { useEffect } from "react"

interface TaskFormProjectProps {
  projectId: string;
  onChange: (projectId: string) => void;
}

export function TaskFormProject({ projectId, onChange }: TaskFormProjectProps) {
  const { projects, isLoading } = useTaskProjects();
  
  // Debug logging
  useEffect(() => {
    console.log("Available projects in TaskFormProject:", projects);
  }, [projects]);
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="project">Project</Label>
      <Select 
        value={projectId} 
        onValueChange={onChange}
      >
        <SelectTrigger id="project">
          <SelectValue placeholder="Select a project">
            {projectId === "inbox" ? (
              <span>Inbox</span>
            ) : projects?.find(p => p.id === projectId) ? (
              <span>{projects.find(p => p.id === projectId)?.name}</span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inbox">
            <span>Inbox</span>
          </SelectItem>
          {projects && projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
            >
              <span>{project.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
