
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Hook for managing filter form state
export function useFilterFormState(open: boolean) {
  const [name, setName] = useState("");
  const [conditions, setConditions] = useState<Array<{
    id: string;
    type: string;
    value: string;
    operator?: string;
  }>>([]);
  const [logic, setLogic] = useState("and");
  const [isLoading, setIsLoading] = useState(false);
  const [isNameError, setIsNameError] = useState(false);
  
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("");
      setConditions([]);
      setLogic("and");
      setIsNameError(false);
    }
  }, [open]);

  // Function to validate filter name
  const validateFilterName = (filterName: string, existingFilters: any[] = []) => {
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

  return {
    name,
    setName,
    conditions,
    setConditions,
    logic,
    setLogic,
    isLoading,
    setIsLoading,
    isNameError,
    setIsNameError,
    validateFilterName,
  };
}
