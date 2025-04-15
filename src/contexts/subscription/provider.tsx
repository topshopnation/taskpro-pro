
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionContext } from "./context";
import { SubscriptionUpdate } from "./types";
import { useSubscriptionState } from "./hooks/useSubscriptionState";
import { useSubscriptionRealtime } from "./hooks/useSubscriptionRealtime";
import { subscriptionService } from "./services/subscriptionService";

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const {
    subscription,
    loading,
    isActive,
    isTrialActive,
    daysRemaining,
    updateState,
    setLoading
  } = useSubscriptionState();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      console.log("No user, skipping subscription fetch");
      setLoading(false);
      updateState(null);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching subscription for user:", user.id);
      const data = await subscriptionService.fetchSubscription(user.id);
      console.log("Subscription data fetched:", data);
      updateState(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user, setLoading, updateState]);

  // Fetch subscription data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("User authenticated, fetching subscription");
      fetchSubscription();
    } else {
      console.log("No user authenticated, resetting subscription state");
      updateState(null);
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id]);

  const updateSubscription = useCallback(async (update: SubscriptionUpdate) => {
    if (!user?.id) {
      console.error("Cannot update subscription: No authenticated user");
      throw new Error("You must be signed in to update your subscription.");
    }

    const updatedSubscription = await subscriptionService.updateSubscription(user.id, update);
    updateState(updatedSubscription);
  }, [user, updateState]);

  // Setup realtime subscription updates
  useSubscriptionRealtime(user?.id, updateState);

  const value = {
    isActive,
    isTrialActive,
    subscription,
    daysRemaining,
    loading,
    initialized,
    updateSubscription,
    fetchSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
