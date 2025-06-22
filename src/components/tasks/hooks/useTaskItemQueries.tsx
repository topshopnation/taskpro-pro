
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

    // Create promises for all refetch operations
    const refetchPromises = [
      // Standard query refetches
      ...queryKeysToInvalidate.map(queryKey => 
        queryClient.refetchQueries({ queryKey })
      ),
      // Filtered task query refetches
      ...filteredTaskQueries.map(query => 
        queryClient.refetchQueries({ queryKey: query.queryKey })
      )
    ];

    // Wait for ALL queries to complete before returning
    await Promise.all(refetchPromises);
  };

  return { invalidateAllTaskQueries };
}
