
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";

export function useEditFilterForm({
  open,
  filterName,
  filterColor,
  filterConditions,
  onFilterNameChange,
  onFilterColorChange,
  onFilterConditionsChange
}: {
  open: boolean;
  filterName: string;
  filterColor: string;
  filterConditions: any;
  onFilterNameChange: (name: string) => void;
  onFilterColorChange: (color: string) => void;
  onFilterConditionsChange: (conditions: any) => void;
}) {
  const [activeTab, setActiveTab] = useState("basics");
  const [conditionType, setConditionType] = useState("due");
  const [conditionValue, setConditionValue] = useState("");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const { projects } = useTaskProjects();

  // Reset form values when dialog opens
  useEffect(() => {
    if (open) {
      setConditionType("due");
      setConditionValue("");
      setConditionOperator("equals");
      setSelectedDate(undefined);
    }
  }, [open]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Convert date to a format our filter system can understand
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      
      // Determine which standard date period to use
      if (date.getTime() === today.getTime()) {
        setConditionValue("today");
      } else if (date.getTime() === tomorrow.getTime()) {
        setConditionValue("tomorrow");
      } else if (date >= thisWeekStart && date <= thisWeekEnd) {
        setConditionValue("this_week");
      } else if (date >= nextWeekStart && date < new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        setConditionValue("next_week");
      } else {
        // For dates that don't fit standard periods, use the date directly
        setConditionValue(format(date, "yyyy-MM-dd"));
      }
    }
  };

  // Handle adding a new condition
  const handleAddCondition = () => {
    if (!conditionValue) {
      console.log("No condition value selected");
      return;
    }

    const newCondition = {
      type: conditionType,
      operator: conditionOperator,
      value: conditionValue,
    };
    
    // Add to existing conditions
    const currentItems = Array.isArray(filterConditions.items) ? filterConditions.items : [];
    const updatedConditions = {
      items: [...currentItems, newCondition],
      logic: filterConditions.logic || "and",
    };
    
    onFilterConditionsChange(updatedConditions);
    
    // Reset form
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    setSelectedDate(undefined);
  };

  // Handle removing a condition
  const handleRemoveCondition = (index: number) => {
    if (!filterConditions.items) return;
    
    const updatedItems = [...filterConditions.items];
    updatedItems.splice(index, 1);
    
    const updatedConditions = {
      ...filterConditions,
      items: updatedItems,
    };
    
    onFilterConditionsChange(updatedConditions);
  };

  // Handle changing condition logic (AND/OR)
  const handleLogicChange = (logic: string) => {
    const updatedConditions = {
      ...filterConditions,
      logic,
    };
    
    onFilterConditionsChange(updatedConditions);
  };

  return {
    activeTab,
    setActiveTab,
    conditionType,
    setConditionType,
    conditionValue,
    setConditionValue,
    conditionOperator,
    setConditionOperator,
    selectedDate,
    handleDateSelect,
    handleAddCondition,
    handleRemoveCondition,
    handleLogicChange,
    projects
  };
}
