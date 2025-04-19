
import React from "react";
import { Subscription, SubscriptionUpdate } from "./types";

export interface SubscriptionContextType {
  isActive: boolean;
  isTrialActive: boolean;
  subscription: Subscription | null;
  daysRemaining: number;
  loading: boolean;
  initialized: boolean;
  updateSubscription: (update: SubscriptionUpdate) => Promise<Subscription>;
  fetchSubscription: () => Promise<Subscription | null>;
}

export const SubscriptionContext = React.createContext<SubscriptionContextType>({
  isActive: false,
  isTrialActive: false,
  subscription: null,
  daysRemaining: 0,
  loading: true,
  initialized: false,
  updateSubscription: async () => {
    throw new Error("updateSubscription not implemented");
  },
  fetchSubscription: async () => {
    throw new Error("fetchSubscription not implemented");
  },
});
