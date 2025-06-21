
import { Subscription } from './types';

export const updateSubscriptionStatus = (subscription: Subscription | null) => {
  if (!subscription) {
    return {
      isActive: false,
      isTrialActive: false,
      daysRemaining: 0
    };
  }

  const now = new Date();
  
  // Check if subscription is in trial
  if (subscription.status === 'trial' && subscription.trial_end_date) {
    const trialEnd = new Date(subscription.trial_end_date);
    const isTrialActive = trialEnd > now;
    const daysRemaining = isTrialActive 
      ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    return {
      isActive: isTrialActive,
      isTrialActive,
      daysRemaining
    };
  }

  // Check if subscription is active
  if (subscription.status === 'active') {
    if (subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      const isActive = periodEnd > now;
      
      return {
        isActive,
        isTrialActive: false,
        daysRemaining: 0
      };
    }
    
    // If no period end date, assume active
    return {
      isActive: true,
      isTrialActive: false,
      daysRemaining: 0
    };
  }

  // For expired, canceled, or other statuses
  return {
    isActive: false,
    isTrialActive: false,
    daysRemaining: 0
  };
};
