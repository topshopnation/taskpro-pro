
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CustomFilter, standardFilters } from "@/types/filterTypes";
import { Filter } from "@/types/supabase";

export function useFetchFilter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchFilter = async () => {
    if (!id) return null;
    
    // Check if it's a standard filter first
    const standardFilter = standardFilters.find(filter => filter.id === id);
    if (standardFilter) {
      return standardFilter;
    }
    
    // If not a standard filter and no user, return null
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // Filter not found
          toast.error("Filter not found");
          navigate('/filters');
          return null;
        }
        throw error;
      }
      
      // Cast the data to include favorite property
      const filterData = data as Filter;
      
      return {
        id: filterData.id,
        name: filterData.name,
        conditions: filterData.conditions,
        logic: "and",
        favorite: filterData.favorite ?? false,
        color: filterData.color || null,
        user_id: filterData.user_id,
        created_at: filterData.created_at || "",
        updated_at: filterData.updated_at || ""
      } as CustomFilter;
    } catch (error: any) {
      console.error('Error fetching filter:', error);
      toast.error("Failed to fetch filter", {
        description: error.message
      });
      navigate('/filters');
      return null;
    }
  };
  
  const { data: currentFilter, isLoading } = useQuery({
    queryKey: ['filter', id, user?.id],
    queryFn: fetchFilter,
    enabled: !!id
  });

  return {
    currentFilter,
    isLoading,
    filterId: id
  };
}
