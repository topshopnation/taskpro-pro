
import { useState, useEffect } from "react";
import { CustomFilter } from "@/types/filterTypes";

export function useFilterEditState(currentFilter: CustomFilter | null) {
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false);
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterConditions, setFilterConditions] = useState<any>({ items: [], logic: "and" });
  
  useEffect(() => {
    if (currentFilter) {
      setNewFilterName(currentFilter.name);
      setFilterColor(currentFilter.color || "");
      
      // Handle both condition formats (array or object with items)
      if (currentFilter.conditions) {
        if (Array.isArray(currentFilter.conditions)) {
          setFilterConditions({ items: currentFilter.conditions, logic: "and" });
        } else if (typeof currentFilter.conditions === 'object') {
          // Ensure the conditions object has the expected structure
          const items = currentFilter.conditions.items || [];
          const logic = currentFilter.conditions.logic || "and";
          setFilterConditions({ items, logic });
        } else {
          setFilterConditions({ items: [], logic: "and" });
        }
      } else {
        setFilterConditions({ items: [], logic: "and" });
      }
    }
  }, [currentFilter]);
  
  return {
    isEditFilterOpen,
    setIsEditFilterOpen,
    isDeleteFilterOpen,
    setIsDeleteFilterOpen,
    newFilterName,
    setNewFilterName,
    filterColor,
    setFilterColor,
    filterConditions,
    setFilterConditions
  };
}
