
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck, AlertCircle } from "lucide-react";
import { useSubscriptionCard } from "./subscription/useSubscriptionCard";
import { SubscriptionCardSkeleton } from "./subscription/SubscriptionCardSkeleton";
import { SubscriptionStatus } from "./subscription/SubscriptionStatus";
import { SubscriptionFeatures } from "./subscription/SubscriptionFeatures";
import { SubscriptionCardProps } from "@/types/subscriptionTypes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const [prices, setPrices] = useState<{ monthly: number; yearly: number }>({ monthly: 9.99, yearly: 99.99 });
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [yearlyDiscount, setYearlyDiscount] = useState(17);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly, price_yearly')
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.warn('Could not fetch subscription prices from database:', error);
          // Use default prices if database fetch fails
          setPricesError("Using default pricing");
        } else if (data) {
          const monthly = data.price_monthly;
          const yearly = data.price_yearly;
          
          const calculatedDiscount = Math.round(
            ((monthly * 12 - yearly) / (monthly * 12)) * 100
          );
          
          setPrices({ monthly, yearly });
          setYearlyDiscount(calculatedDiscount);
          setPricesError(null);
        } else {
          // No data found, use defaults
          console.warn('No subscription plan found in database, using defaults');
          setPricesError("Using default pricing");
        }
      } catch (error) {
        console.error('Error fetching subscription prices:', error);
        setPricesError("Could not load pricing");
      } finally {
        setPricesLoading(false);
      }
    }

    fetchPrices();
  }, []);

  if (!hasRendered || !isStable || pricesLoading) {
    return <SubscriptionCardSkeleton />;
  }

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
        {pricesError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{pricesError}</AlertDescription>
          </Alert>
        )}
        
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
