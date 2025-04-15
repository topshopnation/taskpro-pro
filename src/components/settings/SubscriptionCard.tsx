
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/subscription";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

interface SubscriptionCardProps {
  onUpgrade: () => void;
}

export default function SubscriptionCard({ onUpgrade }: SubscriptionCardProps) {
  const { 
    subscription, 
    loading, 
    isActive, 
    isTrialActive,
    daysRemaining,
    fetchSubscription,
    initialized
  } = useSubscription();
  
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);
  const [hasRendered, setHasRendered] = useState(false);
  
  // Make sure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("SubscriptionCard: Fetching subscription data");
      fetchSubscription();
    }
  }, [loading, initialized, fetchSubscription]);
  
  useEffect(() => {
    if (subscription?.current_period_end) {
      setFormattedExpiryDate(format(new Date(subscription.current_period_end), 'MMM d, yyyy'));
    } else if (subscription?.trial_end_date) {
      setFormattedExpiryDate(format(new Date(subscription.trial_end_date), 'MMM d, yyyy'));
    } else {
      setFormattedExpiryDate(null);
    }
  }, [subscription]);
  
  // Use this effect to prevent flashing during initial load
  useEffect(() => {
    if (!loading && initialized) {
      setHasRendered(true);
    }
  }, [loading, initialized]);

  // Display loading state until we have finished initializing
  if (!hasRendered || loading || !initialized) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm">Subscription</CardTitle>
          <CardDescription className="text-xs">Loading subscription...</CardDescription>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-3">
          <div className="h-32 flex flex-col items-center justify-center">
            <div className="animate-pulse bg-primary/10 h-4 w-5/6 rounded mb-2"></div>
            <div className="animate-pulse bg-primary/10 h-4 w-3/6 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get subscription details based on status
  let planName = "";
  let statusBadge;
  let showRenewButton = false;
  
  if (isTrialActive) {
    planName = "Trial Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <Clock className="h-3 w-3 mr-1 text-amber-500" /> Trial
      </Badge>
    );
  } else if (subscription?.status === 'active') {
    planName = subscription.plan_type === 'monthly' ? "Monthly Subscription" : "Annual Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <BadgeCheck className="h-3 w-3 mr-1 text-green-500" /> Active
      </Badge>
    );
    
    // Check if within renewal period
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    showRenewButton = daysUntilExpiry <= 14;
  } else {
    planName = "No Active Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <Clock className="h-3 w-3 mr-1" /> Inactive
      </Badge>
    );
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
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        <div className="flex items-center justify-between border rounded-md p-3 mb-2">
          <div>
            <h4 className="text-xs font-medium">Current Plan</h4>
            <p className="text-xs text-muted-foreground">
              {planName}
            </p>
            {formattedExpiryDate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTrialActive ? "Trial ends" : subscription?.status === 'active' ? "Renews" : "Expired"} on {formattedExpiryDate}
              </p>
            )}
          </div>
          {isTrialActive && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-amber-600 font-medium mb-0.5">{daysRemaining} days left</span>
              <Progress value={(daysRemaining / 14) * 100} className="h-1.5 w-20" />
            </div>
          )}
          {subscription?.status === 'active' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              Active
            </Badge>
          )}
          {subscription?.status === 'expired' && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
              Expired
            </Badge>
          )}
        </div>

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
        <ul className="space-y-1.5 pl-0.5">
          <li className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            <span>Unlimited projects and tasks</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            <span>Advanced filtering and sorting</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            <span>Priority customer support</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            <span>Theme customization</span>
          </li>
          <li className="flex items-center gap-1.5 text-xs">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            <span>Automatic renewal for uninterrupted service</span>
          </li>
        </ul>
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
