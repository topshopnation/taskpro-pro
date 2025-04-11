
import React, { createContext, useContext } from "react";
import { SubscriptionContextType } from "./types";

// Create the context
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export { SubscriptionContext };
