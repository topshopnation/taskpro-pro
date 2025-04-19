
import { createContext, useContext } from 'react';
import { SubscriptionContextType } from './subscription/types';
import { useSubscription as useSubscriptionHook } from './subscription/context';
import { SubscriptionProvider as SubscriptionProviderComponent } from './subscription/provider';

// Export the subscription provider
export const SubscriptionProvider = SubscriptionProviderComponent;

// Create subscription context with default values
export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Create useSubscription hook
export const useSubscription = () => {
  return useSubscriptionHook();
};
