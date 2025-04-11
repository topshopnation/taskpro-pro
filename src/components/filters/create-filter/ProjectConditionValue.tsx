
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";

interface ProjectConditionValueProps {
  conditionValue: string;
  setConditionValue: (value: string) => void;
}

export function ProjectConditionValue({
  conditionValue,
  setConditionValue
}: ProjectConditionValueProps) {
  const { projects } = useTaskProjects();
  
  return (
    <Select value={conditionValue} onValueChange={setConditionValue}>
      <SelectTrigger id="condition-value-select">
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="inbox">Inbox</SelectItem>
        {projects && projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
