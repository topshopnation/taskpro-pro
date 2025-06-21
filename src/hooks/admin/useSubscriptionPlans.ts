
import { useState, useEffect } from "react";
import { SubscriptionPlan } from "@/types/adminTypes";
import { subscriptionPlansService } from "@/services/admin/subscription-plans-service";
import { toast } from "sonner";

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      console.log("Fetching subscription plans via admin service...");
      
      // Use the admin subscription plans service
      const plansData = await subscriptionPlansService.getSubscriptionPlans();
      
      console.log("Fetched plans:", plansData);
      setPlans(plansData || []);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to load subscription plans. Please check if you're logged in as an admin.");
      setPlans([]);
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
