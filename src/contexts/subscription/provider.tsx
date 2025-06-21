
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
  const lastFetchTime = useRef(0);
  const lastUpdateTime = useRef(0);
  const initialLoadDone = useRef(false);
  
  const {
    subscription,
    loading,
    isActive,
    isTrialActive,
    daysRemaining,
    updateState,
    setLoading
  } = useSubscriptionState();

  const fetchSubscription = useCallback(async (force = false) => {
    if (!user) {
      console.log("No user, setting default state");
      setLoading(false);
      updateState(null);
      setInitialized(true);
      initialLoadDone.current = true;
      return null;
    }

    // For forced refreshes, bypass throttling and locking
    if (!force) {
      // Prevent fetch spam with minimum time between fetches
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime.current;
      if (timeSinceLastFetch < 2000 && lastFetchTime.current > 0) { // Reduced from 3000 to 2000
        console.log("Throttling subscription fetch, last fetch was", timeSinceLastFetch, "ms ago");
        return subscription;
      }

      // Use a ref-based lock to prevent concurrent fetches
      if (isFetching || fetchLock.current) {
        console.log("Already fetching subscription, skipping");
        return subscription;
      }
    }

    try {
      if (!force) {
        fetchLock.current = true;
      }
      setIsFetching(true);
      
      // Only show loading state on initial load
      if (!initialLoadDone.current) {
        setLoading(true);
      }
      
      console.log("Fetching subscription for user:", user.id, force ? "(forced)" : "");
      const data = await subscriptionService.fetchSubscription(user.id, force);
      console.log("Subscription data fetched:", data);
      
      // Update last fetch time
      lastFetchTime.current = Date.now();
      
      // Apply the subscription update immediately
      updateState(data);
      setInitialized(true);
      setLoading(false);
      setIsFetching(false);
      initialLoadDone.current = true;
      
      return data;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      setInitialized(true);
      setLoading(false);
      setIsFetching(false);
      initialLoadDone.current = true;
      return null;
    } finally {
      if (!force) {
        fetchLock.current = false;
      }
    }
  }, [user, setLoading, updateState, isFetching, subscription]);

  // Fetch subscription data when user changes, but only once per user
  useEffect(() => {
    if (user && !isFetching && !initialLoadDone.current && !fetchLock.current) {
      console.log("User authenticated, fetching subscription");
      fetchSubscription();
    } else if (!user) {
      console.log("No user authenticated, resetting subscription state");
      updateState(null);
      setLoading(false);
      setInitialized(true);
      initialLoadDone.current = false; // Reset for next user
    }
  }, [user?.id, fetchSubscription, isFetching]);

  const updateSubscription = useCallback(async (update: SubscriptionUpdate) => {
    if (!user?.id) {
      console.error("Cannot update subscription: No authenticated user");
      throw new Error("You must be signed in to update your subscription.");
    }

    // Prevent update spam with minimum time between updates
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    if (timeSinceLastUpdate < 1000 && lastUpdateTime.current > 0) { // Reduced from 2000 to 1000
      console.log("Throttling subscription update, last update was", timeSinceLastUpdate, "ms ago");
      throw new Error("Please wait a moment before updating your subscription again.");
    }

    try {
      setLoading(true);
      console.log("Starting subscription update for user:", user.id, "with data:", update);
      const updatedSubscription = await subscriptionService.updateSubscription(user.id, update);
      
      lastUpdateTime.current = Date.now();
      console.log("Subscription updated successfully:", updatedSubscription);
      
      // Update immediately but don't trigger additional fetches
      updateState(updatedSubscription);
      setLoading(false);
      return updatedSubscription;
    } catch (error) {
      console.error("Error updating subscription:", error);
      setLoading(false);
      throw error;
    }
  }, [user, updateState, setLoading]);

  // Setup realtime subscription updates with throttled handling
  const handleSubscriptionUpdate = useCallback((updatedSubscription) => {
    console.log("Realtime subscription update received:", updatedSubscription);
    // Only update if this is more recent than what we have
    if (!subscription || new Date(updatedSubscription.updated_at) > new Date(subscription.updated_at)) {
      updateState(updatedSubscription);
    }
  }, [updateState, subscription]);
  
  useSubscriptionRealtime(user?.id, handleSubscriptionUpdate);

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
