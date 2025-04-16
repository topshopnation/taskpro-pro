
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  const [isFetching, setIsFetching] = useState(false);
  const fetchLock = useRef(false);
  
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
      setInitialized(true);
      return;
    }

    // Use a ref-based lock to prevent concurrent fetches
    if (isFetching || fetchLock.current) {
      console.log("Already fetching subscription, skipping");
      return;
    }

    try {
      fetchLock.current = true;
      setIsFetching(true);
      setLoading(true);
      console.log("Fetching subscription for user:", user.id);
      const data = await subscriptionService.fetchSubscription(user.id);
      console.log("Subscription data fetched:", data);
      
      // Apply the subscription update once without delays to prevent flickering
      updateState(data);
      setInitialized(true);
      setLoading(false);
      setIsFetching(false);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setInitialized(true);
      setLoading(false);
      setIsFetching(false);
    } finally {
      fetchLock.current = false;
    }
  }, [user, setLoading, updateState, isFetching]);

  // Fetch subscription data when component mounts or user changes
  useEffect(() => {
    if (user && !isFetching && !initialized && !fetchLock.current) {
      console.log("User authenticated, fetching subscription");
      fetchSubscription();
    } else if (!user) {
      console.log("No user authenticated, resetting subscription state");
      updateState(null);
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id, fetchSubscription, isFetching, initialized]);

  const updateSubscription = useCallback(async (update: SubscriptionUpdate) => {
    if (!user?.id) {
      console.error("Cannot update subscription: No authenticated user");
      throw new Error("You must be signed in to update your subscription.");
    }

    try {
      setLoading(true);
      console.log("Starting subscription update for user:", user.id, "with data:", update);
      const updatedSubscription = await subscriptionService.updateSubscription(user.id, update);
      
      console.log("Subscription updated successfully:", updatedSubscription);
      // Update immediately without artificial delays
      updateState(updatedSubscription);
      setLoading(false);
    } catch (error) {
      console.error("Error updating subscription:", error);
      setLoading(false);
      throw error;
    }
  }, [user, updateState, setLoading]);

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
