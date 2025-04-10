
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { CreateFilterDialog } from "@/components/filters/CreateFilterDialog";
import { FiltersList } from "@/components/filters/FiltersList";

export default function FiltersPage() {
  const [filters, setFilters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateFilterOpen, setIsCreateFilterOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchFilters = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('filters')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (error) throw error;

        setFilters(data || []);
      } catch (error: any) {
        console.error('Error fetching filters:', error);
        toast.error('Failed to load filters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();

    // Set up real-time listener
    const subscription = supabase
      .channel('filters-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'filters', filter: `user_id=eq.${user.id}` },
        () => fetchFilters()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h1 className="text-2xl font-bold tracking-tight">Filters</h1>
          </div>
          <Button onClick={() => setIsCreateFilterOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>New Filter</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filters.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No filters found</h3>
            <p className="text-muted-foreground mb-4">Create your first filter to get started</p>
            <Button onClick={() => setIsCreateFilterOpen(true)}>
              Create Filter
            </Button>
          </div>
        ) : (
          <FiltersList filters={filters} />
        )}

        <CreateFilterDialog 
          open={isCreateFilterOpen}
          onOpenChange={setIsCreateFilterOpen}
        />
      </div>
    </AppLayout>
  );
}
