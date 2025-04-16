// Types for subscription status
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled';
export type SubscriptionPlanType = 'monthly' | 'yearly';

// Type for subscription data
export interface Subscription {
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
export interface SubscriptionUpdate {
  status?: SubscriptionStatus;
  planType?: SubscriptionPlanType;
  trialStartDate?: string;
  trialEndDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

// Context type definition
export interface SubscriptionContextType {
  isActive: boolean;
  isTrialActive: boolean;
  subscription: Subscription | null;
  daysRemaining: number;
  loading: boolean;
  initialized: boolean;
  updateSubscription: (update: SubscriptionUpdate) => Promise<void>;
  fetchSubscription: () => Promise<void>;
}
