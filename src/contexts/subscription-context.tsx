
import { createContext, useContext } from 'react';
import { SubscriptionContextType } from './subscription';
import { useSubscription as useSubscriptionHook } from './subscription/context';

// Create subscription context with default values
export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Create useSubscription hook
export const useSubscription = () => {
  return useSubscriptionHook();
};
