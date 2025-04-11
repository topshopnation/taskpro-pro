
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { SubscriptionContext } from "./context";
import { Subscription, SubscriptionStatus, SubscriptionPlanType, SubscriptionUpdate } from "./types";
import { updateSubscriptionStatus } from "./utils";

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Update subscription in database
  const updateSubscription = async (update: SubscriptionUpdate) => {
    if (!user || !subscription) return;
    
    try {
      const { status, planType, trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd } = update;
      
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status: status as SubscriptionStatus,
          plan_type: planType as SubscriptionPlanType,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Refresh subscription data
      fetchSubscription();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription. Please try again.");
    }
  };

  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          // No subscription found, user might need to create one
          setSubscription(null);
        } else {
          throw error;
        }
      } else if (data) {
        // Convert string status to proper SubscriptionStatus type
        const typedData: Subscription = {
          ...data,
          status: data.status as SubscriptionStatus,
          plan_type: data.plan_type as SubscriptionPlanType
        };
        setSubscription(typedData);
        
        // Check if subscription has expired but hasn't been updated in the database
        const now = new Date();
        const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
        
        if (data.status === 'active' && periodEnd && periodEnd < now) {
          // Subscription has expired, update in database
          await updateSubscription({
            status: 'expired',
          });
          
          const status = updateSubscriptionStatus({
            ...typedData,
            status: 'expired'
          });
          
          setIsActive(status.isActive);
          setIsTrialActive(status.isTrialActive);
          setDaysRemaining(status.daysRemaining);
        } else {
          const status = updateSubscriptionStatus(typedData);
          setIsActive(status.isActive);
          setIsTrialActive(status.isTrialActive);
          setDaysRemaining(status.daysRemaining);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  // Check subscription expiration periodically
  useEffect(() => {
    if (!user || !subscription) return;
    
    // Set up interval to check subscription status every hour
    const checkInterval = setInterval(() => {
      const status = updateSubscriptionStatus(subscription);
      
      // If status has changed, update state and potentially database
      if (status.isActive !== isActive || status.isTrialActive !== isTrialActive) {
        setIsActive(status.isActive);
        setIsTrialActive(status.isTrialActive);
        setDaysRemaining(status.daysRemaining);
        
        // If subscription has expired, update it in the database
        if (!status.isActive && !status.isTrialActive && subscription.status === 'active') {
          updateSubscription({
            status: 'expired'
          });
        }
      }
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(checkInterval);
  }, [user, subscription, isActive, isTrialActive]);

  // Setup realtime subscription updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel("subscription-updates")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "subscriptions",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newData = payload.new as any;
        const typedData: Subscription = {
          ...newData,
          status: newData.status as SubscriptionStatus,
          plan_type: newData.plan_type as SubscriptionPlanType
        };
        setSubscription(typedData);
        
        const status = updateSubscriptionStatus(typedData);
        setIsActive(status.isActive);
        setIsTrialActive(status.isTrialActive);
        setDaysRemaining(status.daysRemaining);
      })
      .subscribe();
    
    // Fetch initial data
    fetchSubscription();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value = {
    isActive,
    isTrialActive,
    subscription,
    daysRemaining,
    loading,
    updateSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
