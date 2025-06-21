
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { useSubscription } from "@/contexts/subscription";

interface SubscriptionActionsProps {
  onUpgrade: () => void;
}

export function SubscriptionActions({ onUpgrade }: SubscriptionActionsProps) {
  const { subscription, isTrialActive, daysRemaining } = useSubscription();

  const getButtonConfig = () => {
    // Check if user has expired trial
    const hasExpiredTrial = subscription?.status === 'expired' && subscription.trial_end_date;
    
    // Trial users
    if (isTrialActive) {
      if (daysRemaining <= 3) {
        return {
          text: "Upgrade Before Trial Ends",
          variant: "default" as const,
          icon: CreditCard,
          urgent: true
        };
      }
      return {
        text: "Upgrade Trial",
        variant: "default" as const,
        icon: CreditCard,
        urgent: false
      };
    }

    // Expired trial users - must upgrade to paid plan
    if (hasExpiredTrial) {
      return {
        text: "Upgrade to Paid Plan",
        variant: "default" as const,
        icon: CreditCard,
        urgent: true
      };
    }

    // Active subscription users - check if expired
    if (subscription?.status === 'active') {
      const currentDate = new Date();
      const endDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      const isExpired = endDate && endDate < currentDate;
      
      if (isExpired) {
        return {
          text: "Renew Subscription",
          variant: "default" as const,
          icon: CreditCard,
          urgent: true
        };
      }
      
      // Active subscription that's not expired - don't show button
      return null;
    }

    // Canceled users
    if (subscription?.status === 'canceled') {
      return {
        text: "Renew Subscription",
        variant: "default" as const,
        icon: CreditCard,
        urgent: true
      };
    }

    // No subscription
    return {
      text: "Subscribe Now",
      variant: "default" as const,
      icon: CreditCard,
      urgent: false
    };
  };

  // Check if within 14 days of subscription end
  const isWithin14Days = () => {
    if (!subscription) return false;
    
    const currentDate = new Date();
    let endDate: Date | null = null;
    
    // For trial subscriptions
    if (subscription.trial_end_date) {
      endDate = new Date(subscription.trial_end_date);
    }
    // For paid subscriptions
    else if (subscription.current_period_end) {
      endDate = new Date(subscription.current_period_end);
    }
    
    if (!endDate) return false;
    
    const daysUntilEnd = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 14;
  };

  const buttonConfig = getButtonConfig();

  // Don't show button if:
  // 1. No button config (active subscription that's not expired)
  // 2. Active subscription with valid PayPal ID that's not within 14 days or expired
  if (!buttonConfig) {
    return null;
  }

  // Additional check: if subscription is active and has PayPal ID and not within 14 days, don't show
  if (subscription?.status === 'active' && 
      subscription.paypal_subscription_id && 
      !isWithin14Days()) {
    const currentDate = new Date();
    const endDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
    const isExpired = endDate && endDate < currentDate;
    
    if (!isExpired) {
      return null;
    }
  }

  const IconComponent = buttonConfig.icon;
  const hasExpiredTrial = subscription?.status === 'expired' && subscription.trial_end_date;

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={onUpgrade}
        variant={buttonConfig.variant}
        size="sm"
        className={`text-xs h-8 ${buttonConfig.urgent ? 'bg-primary hover:bg-primary/90' : ''}`}
      >
        <IconComponent className="mr-1.5 h-3.5 w-3.5" />
        {buttonConfig.text}
      </Button>
      
      {buttonConfig.urgent && (
        <p className="text-xs text-muted-foreground text-center">
          {isTrialActive && daysRemaining <= 3 
            ? "Trial ending soon - upgrade to continue" 
            : hasExpiredTrial
            ? "Trial expired - upgrade to paid plan required"
            : "Renew to add more time and continue access"}
        </p>
      )}
    </div>
  );
}
