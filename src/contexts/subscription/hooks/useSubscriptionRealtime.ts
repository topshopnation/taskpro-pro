
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subscription, SubscriptionStatus, SubscriptionPlanType } from '../types';

export const useSubscriptionRealtime = (
  userId: string | undefined,
  onSubscriptionUpdate: (subscription: Subscription) => void
) => {
  useEffect(() => {
    if (!userId) {
      console.log("No user, skipping realtime subscription setup");
      return;
    }

    console.log("Setting up realtime subscription for user:", userId);

    const channel = supabase
      .channel("subscription-updates")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "subscriptions",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        console.log("Subscription updated in database:", payload);
        const newData = payload.new as any;
        const typedData: Subscription = {
          ...newData,
          status: newData.status as SubscriptionStatus,
          plan_type: newData.plan_type as SubscriptionPlanType
        };
        onSubscriptionUpdate(typedData);
      })
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "subscriptions",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        console.log("New subscription inserted in database:", payload);
        const newData = payload.new as any;
        const typedData: Subscription = {
          ...newData,
          status: newData.status as SubscriptionStatus,
          plan_type: newData.plan_type as SubscriptionPlanType
        };
        onSubscriptionUpdate(typedData);
      })
      .subscribe();

    return () => {
      console.log("Cleaning up subscription channel");
      supabase.removeChannel(channel);
    };
  }, [userId, onSubscriptionUpdate]);
};
