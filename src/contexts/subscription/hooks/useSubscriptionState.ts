
import { useState } from 'react';
import { Subscription } from '../types';
import { updateSubscriptionStatus } from '../utils';

export const useSubscriptionState = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const updateState = (newSubscription: Subscription | null) => {
    if (!newSubscription) {
      setSubscription(null);
      setIsActive(false);
      setIsTrialActive(false);
      setDaysRemaining(0);
      return;
    }

    setSubscription(newSubscription);
    const status = updateSubscriptionStatus(newSubscription);
    setIsActive(status.isActive);
    setIsTrialActive(status.isTrialActive);
    setDaysRemaining(status.daysRemaining);
  };

  return {
    subscription,
    loading,
    isActive,
    isTrialActive,
    daysRemaining,
    setSubscription,
    setLoading,
    updateState
  };
};
