
import React, { useCallback } from "react";
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
      const data = await subscriptionService.fetchSubscription(user.id);
      updateState(data);
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, updateState]);

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
    updateSubscription,
    fetchSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
