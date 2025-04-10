
import { CalendarIcon, Calendar, Star, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterCondition {
  type: string;
  operator?: string;
  value: string;
}

interface FilterConditionsDisplayProps {
  conditions: FilterCondition[];
  logic?: string;
}

export function FilterConditionsDisplay({ 
  conditions = [],
  logic = "and"
}: FilterConditionsDisplayProps) {
  if (!conditions || conditions.length === 0) {
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
      return { icon: <Tag className="h-3 w-3 mr-1" />, label: `Project: ${condition.value}` };
    }
    
    return { icon: null, label: `${condition.type}: ${condition.value}` };
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {conditions.map((condition, index) => {
        const { icon, label } = getConditionLabel(condition);
        
        return (
          <Badge key={index} variant="outline" className="flex items-center text-xs">
            {icon}
            <span>{label}</span>
            {index < conditions.length - 1 && logic && (
              <span className="ml-1 text-muted-foreground font-medium">
                {logic}
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
