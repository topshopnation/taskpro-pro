
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin service for retrieving activity logs
 */
export const activityLogsService = {
  async getActivityLogs(): Promise<any[]> {
    try {
      // Instead of querying auth_events directly, focus on profile and subscription changes
      // which are tables we know exist in our schema
      
      // Get the last 100 profile updates
      const { data: profileEvents, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
        
      if (profileError) throw profileError;
      
      // Get the last 100 subscription updates
      const { data: subscriptionEvents, error: subError } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan_type, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
        
      if (subError) throw subError;
      
      // Create simulated auth events based on profile creation dates
      // This is a workaround since we can't directly access auth events
      const { data: recentProfiles, error: recentProfilesError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (recentProfilesError) throw recentProfilesError;
      
      const simulatedAuthEvents = (recentProfiles || []).map(profile => ({
        type: 'auth',
        timestamp: profile.created_at,
        details: {
          user_id: profile.id,
          event_type: 'signup',
          created_at: profile.created_at
        }
      }));
      
      // Combine all events and sort by timestamp
      const allEvents = [
        ...simulatedAuthEvents,
        ...(profileEvents || []).map(event => ({
          type: 'profile',
          timestamp: event.updated_at,
          details: event
        })),
        ...(subscriptionEvents || []).map(event => ({
          type: 'subscription',
          timestamp: event.updated_at,
          details: event
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return allEvents.slice(0, 100); // Return only the most recent 100 events
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }
};
