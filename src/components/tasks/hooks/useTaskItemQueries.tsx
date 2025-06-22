
import { queryClient } from "@/lib/react-query";
import { useAuth } from "@/hooks/use-auth";

export function useTaskItemQueries() {
  const { user } = useAuth();

  const invalidateAllTaskQueries = async () => {
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

    // Invalidate all filtered-tasks queries
    if (user?.id) {
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      allQueries.forEach((query) => {
        const queryKey = query.queryKey;
        if (Array.isArray(queryKey) && queryKey[0] === 'filtered-tasks') {
          queryClient.refetchQueries({ queryKey });
        }
      });
    }

    // Refetch all relevant queries immediately
    await Promise.all(queryKeysToInvalidate.map(queryKey => 
      queryClient.refetchQueries({ queryKey })
    ));
  };

  return { invalidateAllTaskQueries };
}
