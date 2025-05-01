
import { useState, useEffect } from "react";
import { UserProfile } from "@/types/adminTypes";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionFormState(user: UserProfile | null, open: boolean) {
  const [status, setStatus] = useState<string>("inactive");
  const [planType, setPlanType] = useState<string>("monthly");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching subscription:", error);
          return;
        }
        
        if (data) {
          setStatus(data.status || "inactive");
          setPlanType(data.plan_type || "monthly");
          
          if (data.current_period_start) {
            setStartDate(new Date(data.current_period_start));
          }
          
          if (data.current_period_end) {
            setExpiryDate(new Date(data.current_period_end));
          }
        }
      } catch (error) {
        console.error("Error in fetchSubscription:", error);
      }
    };
    
    if (open && user) {
      fetchSubscription();
    }
  }, [open, user]);

  return {
    status,
    setStatus,
    planType,
    setPlanType,
    expiryDate,
    setExpiryDate,
    startDate, 
    setStartDate,
    isSubmitting,
    setIsSubmitting
  };
}
