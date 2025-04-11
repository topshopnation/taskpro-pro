
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
      setFilterConditions(currentFilter.conditions || { items: [], logic: "and" });
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
