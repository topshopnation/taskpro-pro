
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { addDays, differenceInDays, parseISO, format } from "date-fns";

export type Subscription = {
  id: string;
  status: 'trial' | 'active' | 'expired' | 'canceled';
  planType: 'monthly' | 'yearly';
  trialStartDate: string | null;
  trialEndDate: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  daysRemaining: number | null;
};

type SubscriptionContextType = {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  isTrialActive: boolean;
  activateTrial: () => Promise<void>;
  updateSubscription: (planType: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  formattedExpiryDate: string | null;
};

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = subscription?.status === 'active' || 
    (subscription?.status === 'trial' && (subscription?.daysRemaining || 0) > 0);
  
  const isTrialActive = subscription?.status === 'trial' && (subscription?.daysRemaining || 0) > 0;
  
  const formattedExpiryDate = subscription?.currentPeriodEnd 
    ? format(parseISO(subscription.currentPeriodEnd), 'MMM dd, yyyy')
    : null;

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
          setSubscription(null);
        } else if (data) {
          // Calculate days remaining in trial or subscription
          let daysRemaining = null;
          if (data.status === 'trial' && data.trial_end_date) {
            daysRemaining = differenceInDays(parseISO(data.trial_end_date), new Date());
            
            // Check if trial has expired
            if (daysRemaining <= 0) {
              // Update subscription status to expired if trial has ended
              await supabase
                .from('subscriptions')
                .update({ status: 'expired' })
                .eq('id', data.id);
              
              data.status = 'expired';
              daysRemaining = 0;
            }
          } else if (data.status === 'active' && data.current_period_end) {
            daysRemaining = differenceInDays(parseISO(data.current_period_end), new Date());
            
            // Check if subscription has expired
            if (daysRemaining <= 0) {
              // Update subscription status to expired
              await supabase
                .from('subscriptions')
                .update({ status: 'expired' })
                .eq('id', data.id);
              
              data.status = 'expired';
              daysRemaining = 0;
            }
          }

          setSubscription({
            id: data.id,
            status: data.status,
            planType: data.plan_type,
            trialStartDate: data.trial_start_date,
            trialEndDate: data.trial_end_date,
            currentPeriodStart: data.current_period_start,
            currentPeriodEnd: data.current_period_end,
            daysRemaining
          });
        }
      } catch (error) {
        console.error('Error processing subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Set up real-time subscription
    const channel = supabase
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Subscription updated:', payload);
        fetchSubscription();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const activateTrial = async () => {
    if (!user || !subscription) return;

    const now = new Date();
    const trialEnd = addDays(now, 14);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'trial',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: trialEnd.toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error activating trial:', error);
      throw error;
    }
  };

  const updateSubscription = async (planType: 'monthly' | 'yearly') => {
    if (!user || !subscription) return;

    const now = new Date();
    // Set period end based on plan type
    const periodEnd = planType === 'monthly' 
      ? addDays(now, 30) 
      : addDays(now, 365);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          plan_type: planType,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!user || !subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
        })
        .eq('id', subscription.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  const value = {
    subscription,
    loading,
    isActive,
    isTrialActive,
    activateTrial,
    updateSubscription,
    cancelSubscription,
    formattedExpiryDate
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
