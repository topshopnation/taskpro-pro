
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin service for managing user subscriptions
 */
export const userSubscriptionsService = {
  async getUserSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  },
  
  async updateUserSubscription(userId: string, status: string, planType: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      return !error;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
  }
};
