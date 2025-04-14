
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
    if (!user || !user.id) {
      console.error("Cannot update subscription: No authenticated user");
      toast.error("You must be signed in to update your subscription.");
      return;
    }
    
    try {
      console.log("Updating subscription for user:", user.id);
      console.log("Update data:", update);
      
      const { status, planType, trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd } = update;
      
      // Check if subscription exists first
      const { data: existingSubscription, error: checkError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      console.log("Existing subscription check:", existingSubscription);
      
      let updateResult;
      
      if (existingSubscription) {
        // Update existing subscription
        console.log("Updating existing subscription");
        updateResult = await supabase
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
          .eq("user_id", user.id)
          .select();
      } else {
        // Create new subscription
        console.log("Creating new subscription");
        updateResult = await supabase
          .from("subscriptions")
          .insert({
            user_id: user.id,
            status: status as SubscriptionStatus,
            plan_type: planType as SubscriptionPlanType,
            trial_start_date: trialStartDate,
            trial_end_date: trialEndDate,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString()
          })
          .select();
      }
      
      if (updateResult.error) {
        throw updateResult.error;
      }
      
      console.log("Subscription updated successfully:", updateResult.data);
      
      // Refresh subscription data
      fetchSubscription();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription. Please try again.");
      throw error;
    }
  };

  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!user) {
      console.log("No user, skipping subscription fetch");
      setLoading(false);
      setSubscription(null);
      setIsActive(false);
      setIsTrialActive(false);
      setDaysRemaining(0);
      return;
    }
    
    try {
      console.log("Fetching subscription for user:", user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          // No subscription found, user might need to create one
          console.log("No subscription found for user");
          setSubscription(null);
          setIsActive(false);
          setIsTrialActive(false);
          setDaysRemaining(0);
        } else {
          throw error;
        }
      } else if (data) {
        console.log("Subscription found:", data);
        
        // Convert string status to proper SubscriptionStatus type
        const typedData: Subscription = {
          ...data,
          status: data.status as SubscriptionStatus,
          plan_type: data.plan_type as SubscriptionPlanType
        };
        setSubscription(typedData);
        
        // Check if subscription has expired but hasn't been updated in the database
        const status = updateSubscriptionStatus(typedData);
        console.log("Subscription status calculated:", status);
        
        const now = new Date();
        
        // Check if trial has expired
        if (typedData.status === 'trial' && typedData.trial_end_date) {
          const trialEnd = new Date(typedData.trial_end_date);
          if (trialEnd < now) {
            console.log("Trial has expired, updating in database");
            // Trial has expired, update in database
            await updateSubscription({
              status: 'expired',
            });
            setIsActive(false);
            setIsTrialActive(false);
            setDaysRemaining(0);
            return;
          }
        }
        
        // Check if regular subscription has expired
        if (typedData.status === 'active' && typedData.current_period_end) {
          const periodEnd = new Date(typedData.current_period_end);
          if (periodEnd < now) {
            console.log("Subscription has expired, updating in database");
            // Subscription has expired, update in database
            await updateSubscription({
              status: 'expired',
            });
            setIsActive(false);
            setIsTrialActive(false);
            setDaysRemaining(0);
            return;
          }
        }
        
        // Set subscription status
        setIsActive(status.isActive);
        setIsTrialActive(status.isTrialActive);
        setDaysRemaining(status.daysRemaining);
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
        console.log("Subscription status changed:", status);
        setIsActive(status.isActive);
        setIsTrialActive(status.isTrialActive);
        setDaysRemaining(status.daysRemaining);
        
        // If subscription has expired, update it in the database
        if (!status.isActive && !status.isTrialActive && subscription.status === 'active') {
          console.log("Subscription expired, updating database");
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
    if (!user) {
      console.log("No user, skipping realtime subscription setup");
      setLoading(false);
      return;
    }
    
    console.log("Setting up realtime subscription for user:", user.id);
    
    const channel = supabase
      .channel("subscription-updates")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "subscriptions",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log("Subscription updated in database:", payload);
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
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public", 
        table: "subscriptions",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        console.log("New subscription inserted in database:", payload);
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
      console.log("Cleaning up subscription channel");
      supabase.removeChannel(channel);
    };
  }, [user]);

  const value = {
    isActive,
    isTrialActive,
    subscription,
    daysRemaining,
    loading,
    updateSubscription,
    fetchSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
