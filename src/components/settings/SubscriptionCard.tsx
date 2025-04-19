
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck } from "lucide-react";
import { useSubscriptionCard } from "./subscription/useSubscriptionCard";
import { SubscriptionCardSkeleton } from "./subscription/SubscriptionCardSkeleton";
import { SubscriptionStatus } from "./subscription/SubscriptionStatus";
import { SubscriptionFeatures } from "./subscription/SubscriptionFeatures";
import { SubscriptionCardProps } from "@/types/subscriptionTypes";

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const {
    subscription,
    isTrialActive,
    daysRemaining,
    formattedExpiryDate,
    hasRendered,
    isStable,
    showRenewButton,
    error
  } = useSubscriptionCard();

  // Display loading state until we have finished initializing and the component is stable
  if (!hasRendered || !isStable) {
    return <SubscriptionCardSkeleton />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Subscription</CardTitle>
            <CardDescription className="text-xs">
              Manage your TaskPro subscription
            </CardDescription>
          </div>
          {/* Removed manage button */}
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        <SubscriptionStatus
          subscription={subscription}
          isTrialActive={isTrialActive}
          daysRemaining={daysRemaining}
          formattedExpiryDate={formattedExpiryDate}
          error={error}
        />

        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BadgeCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="text-xs font-medium">TaskPro Pro</h4>
              <div className="text-xs text-muted-foreground">
                <p>Choose between:</p>
                <ul className="pl-3 mt-0.5 space-y-0.5">
                  <li>$3.00 per month</li>
                  <li>$30.00 per year (save 16%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <SubscriptionFeatures />
      </CardContent>
      <CardFooter className="py-2 px-4">
        <Button 
          onClick={onUpgrade}
          disabled={subscription?.status === 'active' && !showRenewButton}
          size="sm"
          className="text-xs h-8"
        >
          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
          {subscription?.status === 'active' 
            ? showRenewButton 
              ? 'Renew Subscription'
              : 'Currently Subscribed' 
            : 'Subscribe Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
