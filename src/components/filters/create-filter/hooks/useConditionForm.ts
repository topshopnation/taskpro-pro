
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

// Hook for managing condition form state and operations
export function useConditionForm(
  setConditions: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    type: string;
    value: string;
    operator?: string;
  }>>>
) {
  const [conditionType, setConditionType] = useState("due");
  const [conditionValue, setConditionValue] = useState("");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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

  const addCondition = () => {
    if (!conditionValue) {
      toast.error("Condition value is required");
      return;
    }

    const newCondition = {
      id: Date.now().toString(),
      type: conditionType,
      value: conditionValue,
      operator: conditionOperator
    };

    setConditions(prevConditions => [...prevConditions, newCondition]);
    
    // Reset form fields
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    setSelectedDate(undefined);
  };

  const removeCondition = (id: string) => {
    setConditions(prevConditions => prevConditions.filter(condition => condition.id !== id));
  };

  return {
    conditionType,
    setConditionType,
    conditionValue,
    setConditionValue,
    conditionOperator,
    setConditionOperator,
    selectedDate,
    handleDateSelect,
    addCondition,
    removeCondition
  };
}
