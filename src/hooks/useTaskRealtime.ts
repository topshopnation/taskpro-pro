
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FetchCallback = () => Promise<void> | void;

// Change the type to be more flexible - accept any object with an id property
export function useTaskRealtime(user: { id: string } | null, fetchCallback: FetchCallback) {
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('completed-tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        try {
          // Call the callback without awaiting to prevent blocking the handler
          // The callback can still be async and return a Promise
          fetchCallback();
        } catch (error) {
          console.error("Error executing task callback:", error);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCallback]);
}
