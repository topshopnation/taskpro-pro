
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
    setFilterColor
  } = useFilterEditState(currentFilter);
  
  const {
    handleFilterFavoriteToggle,
    handleFilterRename,
    handleFilterDelete,
    handleFilterColorChange
  } = useFilterOperations(filterId);
  
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
    handleFilterFavoriteToggle: () => handleFilterFavoriteToggle(currentFilter),
    handleFilterRename: () => handleFilterRename(newFilterName, filterColor).then(success => {
      if (success) setIsEditFilterOpen(false);
    }),
    handleFilterDelete: () => handleFilterDelete().then(success => {
      if (success) setIsDeleteFilterOpen(false);
    }),
    handleFilterColorChange: (color: string) => {
      // Get the result from handleFilterColorChange but don't pass the Promise to setFilterColor
      const newColor = handleFilterColorChange(color, currentFilter, isEditFilterOpen);
      if (typeof newColor === 'string') {
        setFilterColor(newColor);
      }
    }
  };
}
