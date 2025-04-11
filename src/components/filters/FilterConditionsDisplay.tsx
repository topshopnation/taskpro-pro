
import { CalendarIcon, Calendar, Star, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";

interface FilterCondition {
  type: string;
  operator?: string;
  value: string;
}

interface FilterConditionsDisplayProps {
  conditions: FilterCondition[] | { items: FilterCondition[], logic?: string };
  logic?: string;
}

export function FilterConditionsDisplay({ 
  conditions = [],
  logic = "and"
}: FilterConditionsDisplayProps) {
  // Get projects to display names instead of IDs
  const { projects } = useTaskProjects();
  
  // Handle empty conditions
  if (!conditions) {
    return <div className="text-muted-foreground text-sm">No conditions</div>;
  }
  
  // Normalize conditions to always be an array
  const conditionsArray = Array.isArray(conditions) 
    ? conditions 
    : conditions.items || [];
  
  // Get the logic from either the conditions object or the prop
  const conditionLogic = Array.isArray(conditions) ? logic : (conditions.logic || logic);
  
  // Handle empty array
  if (conditionsArray.length === 0) {
    return <div className="text-muted-foreground text-sm">No conditions</div>;
  }

  const getConditionLabel = (condition: FilterCondition) => {
    if (condition.type === "due") {
      if (condition.value === "today") {
        return { icon: <CalendarIcon className="h-3 w-3 mr-1" />, label: "Due today" };
      } else if (condition.value === "this_week") {
        return { icon: <Calendar className="h-3 w-3 mr-1" />, label: "Due this week" };
      }
    }
    
    if (condition.type === "priority" && condition.value === "1") {
      return { icon: <Star className="h-3 w-3 mr-1" />, label: "Priority 1" };
    }
    
    if (condition.type === "project") {
      // Find project name from ID
      if (condition.value === "inbox") {
        return { icon: <Tag className="h-3 w-3 mr-1" />, label: "Project: Inbox" };
      }
      
      const project = projects?.find(p => p.id === condition.value);
      if (project) {
        return { icon: <Tag className="h-3 w-3 mr-1" />, label: `Project: ${project.name}` };
      }
      
      return { icon: <Tag className="h-3 w-3 mr-1" />, label: `Project: ${condition.value}` };
    }
    
    return { icon: null, label: `${condition.type}: ${condition.value}` };
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {conditionsArray.map((condition, index) => {
        const { icon, label } = getConditionLabel(condition);
        
        return (
          <Badge key={index} variant="outline" className="flex items-center text-xs">
            {icon}
            <span>{label}</span>
            {index < conditionsArray.length - 1 && conditionLogic && (
              <span className="ml-1 text-muted-foreground font-medium">
                {conditionLogic}
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
