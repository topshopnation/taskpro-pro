
import { queryClient } from "@/lib/react-query";
import { useAuth } from "@/hooks/use-auth";

export function useTaskItemQueries() {
  const { user } = useAuth();

  const invalidateAllTaskQueries = async () => {
    if (!user?.id) return;

    const queryKeysToInvalidate = [
      ['tasks'],
      ['today-tasks'],
      ['overdue-tasks'],
      ['inbox-tasks'],
      ['project-tasks'],
      ['search-tasks'],
      ['completedTasks'],
      ['filtered-tasks']
    ];

    // Get all filtered-tasks queries
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.getAll();
    
    const filteredTaskQueries = allQueries.filter((query) => {
      const queryKey = query.queryKey;
      return Array.isArray(queryKey) && queryKey[0] === 'filtered-tasks';
    });

    // Create promises for all invalidation operations (not refetch)
    const invalidationPromises = [
      // Standard query invalidations
      ...queryKeysToInvalidate.map(queryKey => 
        queryClient.invalidateQueries({ queryKey })
      ),
      // Filtered task query invalidations
      ...filteredTaskQueries.map(query => 
        queryClient.invalidateQueries({ queryKey: query.queryKey })
      )
    ];

    // Wait for ALL invalidations to complete
    await Promise.all(invalidationPromises);
    
    // Then force a refetch of all queries to ensure fresh data
    const refetchPromises = [
      ...queryKeysToInvalidate.map(queryKey => 
        queryClient.refetchQueries({ queryKey })
      ),
      ...filteredTaskQueries.map(query => 
        queryClient.refetchQueries({ queryKey: query.queryKey })
      )
    ];

    // Wait for ALL refetches to complete before returning
    await Promise.all(refetchPromises);
  };

  return { invalidateAllTaskQueries };
}
