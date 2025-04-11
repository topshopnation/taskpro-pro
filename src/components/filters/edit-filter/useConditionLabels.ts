
export function useConditionLabels() {
  // Get condition type label
  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case "due":
        return "Due Date";
      case "priority":
        return "Priority";
      case "project":
        return "Project";
      default:
        return type;
    }
  };

  // Get condition value label
  const getConditionValueLabel = (type: string, value: string, projects: any[] = []) => {
    if (type === "due") {
      if (value === "today") return "Today";
      if (value === "tomorrow") return "Tomorrow";
      if (value === "this_week") return "This Week";
      if (value === "next_week") return "Next Week";
      // If it has a date format, return the value as is
      if (value.includes('-')) return value;
    }
    
    if (type === "priority") {
      return `Priority ${value}`;
    }
    
    if (type === "project") {
      const project = projects?.find(p => p.id === value);
      if (project) {
        return project.name;
      } else if (value === "inbox") {
        return "Inbox";
      }
    }
    
    return value;
  };

  // Get full condition label
  const getConditionLabel = (condition: any, projects: any[] = []) => {
    const typeLabel = getConditionTypeLabel(condition.type);
    const operatorLabel = condition.operator === "not_equals" ? "is not" : "is";
    const valueLabel = getConditionValueLabel(condition.type, condition.value, projects);
    
    return `${typeLabel} ${operatorLabel} ${valueLabel}`;
  };

  return {
    getConditionTypeLabel,
    getConditionValueLabel,
    getConditionLabel
  };
}
