
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
      
      // First, check if subscription exists and get current data
      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Calculate appropriate dates for the subscription
      const now = new Date();
      let periodStart = startDate ? startDate : now;
      let periodEnd = expiryDate;
      
      // If there's an existing subscription that's still active, add time to it
      if (existingSubscription && existingSubscription.current_period_end) {
        const currentEndDate = new Date(existingSubscription.current_period_end);
        
        // If the subscription is still active, extend it
        if (currentEndDate > now && expiryDate) {
          console.log("Extending active subscription");
          
          // Calculate the duration of the new subscription period
          const newStartDate = periodStart.getTime();
          const newEndDate = expiryDate.getTime();
          const newDuration = newEndDate - newStartDate;
          
          // Add this duration to the current end date
          periodEnd = new Date(currentEndDate.getTime() + newDuration);
          console.log("Extended end date:", periodEnd);
        }
      }
      
      const subscriptionData = {
        user_id: user.id,
        status,
        plan_type: planType,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd ? periodEnd.toISOString() : null,
        updated_at: new Date().toISOString()
      };
      
      console.log("Updating subscription with data:", subscriptionData);
      
      // Update or insert subscription
      let error;
      if (existingSubscription) {
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
