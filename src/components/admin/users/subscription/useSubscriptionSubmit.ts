
import { useState } from "react";
import { UserProfile } from "@/types/adminTypes";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionSubmit(
  user: UserProfile | null, 
  onSuccess?: () => void, 
  onOpenChange?: (open: boolean) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    status: string, 
    planType: string, 
    startDate?: Date, 
    expiryDate?: Date
  ) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const subscriptionData = {
        user_id: user.id,
        status,
        plan_type: planType,
        current_period_start: startDate ? startDate.toISOString() : new Date().toISOString(),
        current_period_end: expiryDate ? expiryDate.toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      // Check if subscription exists
      const { data, error: checkError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Update or insert subscription
      let error;
      if (data) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', user.id);
        
        error = updateError;
      } else {
        // Insert new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);
        
        error = insertError;
      }
      
      if (error) throw error;
      
      toast.success("Subscription updated successfully");
      if (onSuccess) onSuccess();
      if (onOpenChange) onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription", {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting
  };
}
