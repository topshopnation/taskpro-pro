
import { useState, useEffect } from "react";
import { CustomFilter } from "@/types/filterTypes";

export function useFilterEditState(currentFilter: CustomFilter | null) {
  const [isEditFilterOpen, setIsEditFilterOpen] = useState(false);
  const [isDeleteFilterOpen, setIsDeleteFilterOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [filterColor, setFilterColor] = useState("");
  
  useEffect(() => {
    if (currentFilter) {
      setNewFilterName(currentFilter.name);
      setFilterColor(currentFilter.color || "");
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
    setFilterColor
  };
}
