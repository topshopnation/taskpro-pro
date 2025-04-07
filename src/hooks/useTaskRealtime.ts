
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type FetchCallback = () => Promise<void>;

export function useTaskRealtime(user: User | null, fetchCallback: FetchCallback) {
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('completed-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, async () => {
        // Refetch tasks when changes occur
        await fetchCallback();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCallback]);
}
