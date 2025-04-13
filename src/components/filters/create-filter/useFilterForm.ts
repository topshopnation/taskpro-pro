
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  useFilterFormState, 
  useConditionForm, 
  useConditionLabels,
  useFilterSubmission 
} from './hooks';

export function useFilterForm(open: boolean, onOpenChange: (open: boolean) => void) {
  const { user } = useAuth();
  
  // Use the extracted hooks
  const {
    name,
    setName,
    conditions,
    setConditions,
    logic,
    setLogic,
    isNameError,
    validateFilterName: baseValidateFilterName
  } = useFilterFormState(open);
  
  const {
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
  } = useConditionForm(setConditions);
  
  const { getConditionLabel } = useConditionLabels();

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

  // Wrap the base validateFilterName to include existingFilters
  const validateFilterName = (filterName: string) => {
    return baseValidateFilterName(filterName, existingFilters || []);
  };

  // Use the submission hook with the user from auth context
  const { isLoading, handleSubmit } = useFilterSubmission(
    user, // Pass the user from auth context
    name,
    conditions,
    logic,
    onOpenChange,
    validateFilterName,
    conditionType,
    conditionValue,
    conditionOperator
  );

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
