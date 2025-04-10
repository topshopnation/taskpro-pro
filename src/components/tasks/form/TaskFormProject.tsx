
import { Circle } from "lucide-react"
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
              <div className="flex items-center">
                <Circle className="h-3.5 w-3.5 mr-1.5" />
                <span>Inbox</span>
              </div>
            ) : projects?.find(p => p.id === projectId) ? (
              <div className="flex items-center">
                {projects.find(p => p.id === projectId)?.color && (
                  <Circle className="h-3.5 w-3.5 fill-current mr-1.5" style={{ color: projects.find(p => p.id === projectId)?.color }} />
                )}
                <span>{projects.find(p => p.id === projectId)?.name}</span>
              </div>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="inbox">
            <div className="flex items-center">
              <Circle className="h-3.5 w-3.5 mr-1.5" />
              <span>Inbox</span>
            </div>
          </SelectItem>
          {projects && projects.map((project) => (
            <SelectItem 
              key={project.id} 
              value={project.id}
            >
              <div className="flex items-center">
                {project.color && (
                  <Circle className="h-3.5 w-3.5 fill-current mr-1.5" style={{ color: project.color }} />
                )}
                <span>{project.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
