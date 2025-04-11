
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Condition {
  id: string;
  type: string;
  value: string;
  operator?: string;
}

export function useFilterForm(open: boolean, onOpenChange: (open: boolean) => void) {
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [logic, setLogic] = useState("and");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameError, setIsNameError] = useState(false);
  const { user } = useAuth();
  
  const [conditionType, setConditionType] = useState("due");
  const [conditionValue, setConditionValue] = useState("");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Fetch existing filter names to check for duplicates
  const { data: existingFilters } = useQuery({
    queryKey: ['filter-names', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('filters')
        .select('name')
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Error fetching filter names:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user && open
  });

  const validateFilterName = (filterName: string) => {
    const trimmedName = filterName.trim();
    if (!trimmedName) {
      setIsNameError(true);
      return false;
    }
    
    const isDuplicate = existingFilters?.some(
      filter => filter.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setIsNameError(true);
      toast.error("A filter with this name already exists");
      return false;
    }
    
    setIsNameError(false);
    return true;
  };

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

    const newCondition: Condition = {
      id: Date.now().toString(),
      type: conditionType,
      value: conditionValue,
      operator: conditionOperator
    };

    setConditions([...conditions, newCondition]);
    
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    setSelectedDate(undefined);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id));
  };

  const handleSubmit = async () => {
    if (!validateFilterName(name)) {
      return;
    }

    // Add the current condition if there's a value but user didn't click "Add Condition"
    if (conditionValue && conditions.length === 0) {
      const newCondition: Condition = {
        id: Date.now().toString(),
        type: conditionType,
        value: conditionValue,
        operator: conditionOperator
      };
      setConditions([newCondition]);
      
      // Process submission after state update
      setTimeout(() => submitFilter([newCondition]), 0);
      return;
    }

    if (conditions.length === 0) {
      toast.error("At least one condition is required");
      return;
    }

    submitFilter(conditions);
  };

  const submitFilter = async (conditionsToSubmit: Condition[]) => {
    if (!user) {
      toast.error("You must be logged in to create a filter");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('filters')
        .insert({
          name: name.trim(),
          conditions: {
            logic,
            items: conditionsToSubmit.map(c => ({
              type: c.type,
              value: c.value,
              operator: c.operator
            }))
          },
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Filter created successfully");
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error creating filter: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setConditions([]);
    setLogic("and");
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    setIsNameError(false);
    setSelectedDate(undefined);
  };

  const getConditionLabel = (condition: Condition) => {
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
    name,
    setName,
    conditions,
    logic,
    setLogic,
    isLoading,
    isNameError,
    conditionType,
    setConditionType,
    conditionValue,
    setConditionValue,
    conditionOperator,
    setConditionOperator,
    selectedDate,
    validateFilterName,
    handleDateSelect,
    addCondition,
    removeCondition,
    handleSubmit,
    getConditionLabel
  };
}
