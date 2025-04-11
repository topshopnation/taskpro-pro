import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

// Types for subscription status
type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled';
type SubscriptionPlanType = 'monthly' | 'yearly';

// Type for subscription data
interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan_type: SubscriptionPlanType;
  trial_start_date: string | null;
  trial_end_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// Type for subscription update
interface SubscriptionUpdate {
  status?: SubscriptionStatus;
  planType?: SubscriptionPlanType;
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

// Context type definition
interface SubscriptionContextType {
  isActive: boolean;
  isTrialActive: boolean;
  subscription: Subscription | null;
  daysRemaining: number;
  loading: boolean;
  updateSubscription: (update: SubscriptionUpdate) => Promise<void>;
}

// Create the context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Provider component
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Function to calculate days remaining
  const calculateDaysRemaining = (endDate: string | null) => {
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to update subscription status
  const updateSubscriptionStatus = (sub: Subscription | null) => {
    if (!sub) {
      setIsActive(false);
      setIsTrialActive(false);
      setDaysRemaining(0);
      return;
    }

    const now = new Date();
    
    // Check if trial is active
    if (sub.status === 'trial' && sub.trial_end_date) {
      const trialEnd = new Date(sub.trial_end_date);
      setIsTrialActive(trialEnd > now);
      setDaysRemaining(calculateDaysRemaining(sub.trial_end_date));
      setIsActive(trialEnd > now);
    } 
    // Check if subscription is active
    else if (sub.status === 'active' && sub.current_period_end) {
      const periodEnd = new Date(sub.current_period_end);
      setIsTrialActive(false);
      setDaysRemaining(calculateDaysRemaining(sub.current_period_end));
      setIsActive(periodEnd > now);
    } 
    // Otherwise subscription is not active
    else {
      setIsActive(false);
      setIsTrialActive(false);
      setDaysRemaining(0);
    }
  };

  // Update subscription in database
  const updateSubscription = async (update: SubscriptionUpdate) => {
    if (!user || !subscription) return;
    
    try {
      const { status, planType, trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd } = update;
      
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: status as SubscriptionStatus,
          plan_type: planType as SubscriptionPlanType,
          trial_start_date: trialStartDate,
          trial_end_date: trialEndDate,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Refresh subscription data
      fetchSubscription();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription. Please try again.');
    }
  };

  // Fetch subscription data
  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found, user might need to create one
          setSubscription(null);
        } else {
          throw error;
        }
      } else {
        setSubscription(data);
        updateSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  // Setup realtime subscription updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('subscription-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setSubscription(payload.new as Subscription);
        updateSubscriptionStatus(payload.new as Subscription);
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

// Hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
