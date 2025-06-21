
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink, X } from "lucide-react";
import { useSubscription } from "@/contexts/subscription";
import { CancelSubscriptionDialog } from "./CancelSubscriptionDialog";

interface SubscriptionActionsProps {
  onUpgrade: () => void;
}

export function SubscriptionActions({ onUpgrade }: SubscriptionActionsProps) {
  const { subscription, isTrialActive, daysRemaining } = useSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

    // Active subscription users
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
      
      return {
        text: "Manage Subscription",
        variant: "outline" as const,
        icon: ExternalLink,
        urgent: false
      };
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

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;
  const hasExpiredTrial = subscription?.status === 'expired' && subscription.trial_end_date;
  
  // Show cancel button for active paid subscriptions with PayPal subscription ID
  const showCancelButton = subscription?.status === 'active' && 
                           subscription?.paypal_subscription_id && 
                           !isTrialActive;

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
      
      {showCancelButton && (
        <Button 
          onClick={() => setShowCancelDialog(true)}
          variant="outline"
          size="sm"
          className="text-xs h-8 text-destructive hover:text-destructive"
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancel Subscription
        </Button>
      )}
      
      {buttonConfig.urgent && (
        <p className="text-xs text-muted-foreground text-center">
          {isTrialActive && daysRemaining <= 3 
            ? "Trial ending soon - upgrade to continue" 
            : hasExpiredTrial
            ? "Trial expired - upgrade to paid plan required"
            : "Renew to restore access to premium features"}
        </p>
      )}
      
      <CancelSubscriptionDialog 
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
      />
    </div>
  );
}
