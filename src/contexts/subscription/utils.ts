
import { Subscription } from "./types";

/**
 * Calculates the number of days remaining until a given end date
 */
export const calculateDaysRemaining = (endDate: string | null): number => {
  if (!endDate) return 0;
  
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Determines if a subscription is active based on its status and dates
 */
export const updateSubscriptionStatus = (
  subscription: Subscription | null
): { isActive: boolean; isTrialActive: boolean; daysRemaining: number } => {
  if (!subscription) {
    return { isActive: false, isTrialActive: false, daysRemaining: 0 };
  }

  const now = new Date();
  
  // Check if trial is active
  if (subscription.status === 'trial' && subscription.trial_end_date) {
    const trialEnd = new Date(subscription.trial_end_date);
    const isTrialActive = trialEnd > now;
    return {
      isTrialActive,
      daysRemaining: calculateDaysRemaining(subscription.trial_end_date),
      isActive: isTrialActive
    };
  } 
  // Check if subscription is active and not expired
  else if (subscription.status === 'active' && subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end);
    const isStillActive = periodEnd > now;
    
    // A subscription is only active if it has not expired
    return {
      isTrialActive: false,
      daysRemaining: calculateDaysRemaining(subscription.current_period_end),
      isActive: isStillActive
    };
  } 
  // Otherwise subscription is not active
  else {
    return { isActive: false, isTrialActive: false, daysRemaining: 0 };
  }
};
