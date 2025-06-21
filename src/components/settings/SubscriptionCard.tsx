
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck } from "lucide-react";
import { useSubscriptionCard } from "./subscription/useSubscriptionCard";
import { SubscriptionCardSkeleton } from "./subscription/SubscriptionCardSkeleton";
import { SubscriptionStatus } from "./subscription/SubscriptionStatus";
import { SubscriptionCardProps } from "@/types/subscriptionTypes";
import { useEffect, useState } from "react";
import { subscriptionPlanService, SubscriptionPlanData } from "@/services/subscriptionPlanService";

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const {
    subscription,
    isTrialActive,
    daysRemaining,
    formattedExpiryDate,
    hasRendered,
    isStable,
    showRenewButton,
    error,
    isSubscriptionActive
  } = useSubscriptionCard();

  const [activePlan, setActivePlan] = useState<SubscriptionPlanData | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    async function fetchActivePlan() {
      try {
        setPricesLoading(true);
        const plan = await subscriptionPlanService.getActivePlan();
        
        if (plan) {
          setActivePlan(plan);
        } else {
          setActivePlan(null);
        }
      } catch (error) {
        console.error('Error fetching active subscription plan:', error);
        setActivePlan(null);
      } finally {
        setPricesLoading(false);
      }
    }

    fetchActivePlan();
  }, []);

  if (!hasRendered || !isStable || pricesLoading) {
    return <SubscriptionCardSkeleton />;
  }

  // Determine button text based on subscription state
  const getButtonText = () => {
    if (isTrialActive) {
      return 'Upgrade Now';
    }
    if (isSubscriptionActive && showRenewButton) {
      return 'Renew Subscription';
    }
    if (isSubscriptionActive && !showRenewButton) {
      return 'Manage Subscription';
    }
    return 'Subscribe Now';
  };

  const yearlyDiscount = activePlan ? Math.round(((activePlan.price_monthly * 12 - activePlan.price_yearly) / (activePlan.price_monthly * 12)) * 100) : 0;

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

        {activePlan && (
          <div className="flex items-center justify-between border rounded-md p-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-md">
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-medium">{activePlan.name}</h4>
                <div className="text-xs text-muted-foreground">
                  <p>Live pricing:</p>
                  <ul className="pl-3 mt-0.5 space-y-0.5">
                    <li>${activePlan.price_monthly.toFixed(2)} per month</li>
                    <li>${activePlan.price_yearly.toFixed(2)} per year (save {yearlyDiscount}%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="py-2 px-4">
        <Button 
          onClick={onUpgrade}
          size="sm"
          className="text-xs h-8"
        >
          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  );
}
