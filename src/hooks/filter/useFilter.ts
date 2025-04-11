
import { useFetchFilter } from "./useFetchFilter";
import { useFilterEditState } from "./useFilterEditState";
import { useFilterOperations } from "./useFilterOperations";

export function useFilter() {
  const { currentFilter, isLoading, filterId } = useFetchFilter();
  
  const {
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
  } = useFilterEditState(currentFilter);
  
  const {
    toggleFavorite,
    updateFilter,
    deleteFilter
  } = useFilterOperations(filterId || "");
  
  return {
    currentFilter,
    isLoading,
    isEditFilterOpen,
    setIsEditFilterOpen,
    isDeleteFilterOpen,
    setIsDeleteFilterOpen,
    newFilterName,
    setNewFilterName,
    filterColor,
    setFilterColor,
    filterConditions,
    setFilterConditions,
    handleFilterFavoriteToggle: () => toggleFavorite(currentFilter?.favorite || false),
    handleFilterRename: () => updateFilter(newFilterName, filterConditions, filterColor).then(success => {
      if (success) setIsEditFilterOpen(false);
      return success;
    }),
    handleFilterDelete: () => {
      deleteFilter();
      setIsDeleteFilterOpen(false);
      return Promise.resolve(true);
    },
    handleFilterColorChange: (color: string) => {
      setFilterColor(color);
      return color;
    }
  };
}
