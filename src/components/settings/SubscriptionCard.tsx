
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck } from "lucide-react";
import { useSubscriptionCard } from "./subscription/useSubscriptionCard";
import { SubscriptionCardSkeleton } from "./subscription/SubscriptionCardSkeleton";
import { SubscriptionStatus } from "./subscription/SubscriptionStatus";
import { SubscriptionFeatures } from "./subscription/SubscriptionFeatures";
import { SubscriptionCardProps } from "@/types/subscriptionTypes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const [prices, setPrices] = useState<{ monthly: number; yearly: number }>({ monthly: 0, yearly: 0 });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [yearlyDiscount, setYearlyDiscount] = useState(0);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly, price_yearly')
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          // Force recalculation with fresh data
          const monthly = data.price_monthly;
          const yearly = data.price_yearly;
          
          const calculatedDiscount = Math.round(
            ((monthly * 12 - yearly) / (monthly * 12)) * 100
          );
          
          setPrices({
            monthly,
            yearly
          });
          
          setYearlyDiscount(calculatedDiscount);
        }
      } catch (error) {
        console.error('Error fetching subscription prices:', error);
      } finally {
        setPricesLoading(false);
      }
    }

    fetchPrices();
  }, []);

  if (!hasRendered || !isStable || pricesLoading) {
    return <SubscriptionCardSkeleton />;
  }

  // Determine appropriate button text based on subscription status
  const buttonText = isSubscriptionActive 
    ? showRenewButton 
      ? 'Renew Subscription'
      : 'Currently Subscribed' 
    : 'Subscribe Now';

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
                  <li>${prices.monthly.toFixed(2)} per month</li>
                  <li>${prices.yearly.toFixed(2)} per year (save {yearlyDiscount}%)</li>
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
          disabled={isSubscriptionActive && !showRenewButton}
          size="sm"
          className="text-xs h-8"
        >
          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
