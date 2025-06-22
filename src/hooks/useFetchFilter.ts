
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useFetchFilter(filterId: string) {
  const { user } = useAuth();

  const { data: currentFilter, isLoading } = useQuery({
    queryKey: ['filter', filterId, user?.id],
    queryFn: async () => {
      if (!user || !filterId) return null;

      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('id', filterId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data;
    },
    enabled: !!user && !!filterId,
  });

  return {
    filter: currentFilter,
    currentFilter,
    isLoading,
    filterId
  };
}
