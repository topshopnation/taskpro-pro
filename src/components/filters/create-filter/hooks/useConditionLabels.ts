
// Hook for generating condition labels
export function useConditionLabels() {
  const getConditionLabel = (condition: {
    id: string;
    type: string;
    value: string;
    operator?: string;
  }) => {
    const typeLabels: Record<string, string> = {
      due: "Due Date",
      priority: "Priority",
      project: "Project"
    };
    
    const operatorLabels: Record<string, string> = {
      equals: "is",
      not_equals: "is not"
    };

    const valueLabels: Record<string, Record<string, string>> = {
      due: {
        today: "Today",
        tomorrow: "Tomorrow",
        this_week: "This Week",
        next_week: "Next Week"
      },
      priority: {
        "1": "Priority 1",
        "2": "Priority 2",
        "3": "Priority 3",
        "4": "Priority 4"
      }
    };

    const typeLabel = typeLabels[condition.type] || condition.type;
    const operatorLabel = condition.operator ? operatorLabels[condition.operator] || condition.operator : "";
    
    let valueLabel = condition.value;
    if (condition.type in valueLabels && condition.value in valueLabels[condition.type]) {
      valueLabel = valueLabels[condition.type][condition.value];
    } else if (condition.type === "project") {
      if (condition.value === "inbox") {
        valueLabel = "Inbox";
      }
    }

    return `${typeLabel} ${operatorLabel} ${valueLabel}`;
  };

  return {
    getConditionLabel
  };
}
