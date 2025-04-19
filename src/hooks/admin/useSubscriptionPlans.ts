
import { useState, useEffect } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { adminService } from "@/services/admin-service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data: plansData, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedPlans = plansData.map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlan[];
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    setPlans,
    loading,
    setLoading,
    fetchPlans
  };
}
