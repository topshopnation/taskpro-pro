
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, BadgeCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/subscription";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
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
    daysRemaining
  } = useSubscription();
  
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);
  
  useEffect(() => {
    if (subscription?.current_period_end) {
      setFormattedExpiryDate(format(new Date(subscription.current_period_end), 'MMMM d, yyyy'));
    }
  }, [subscription]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Loading subscription information...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-40 flex items-center justify-center">
            <div className="animate-pulse bg-primary/10 h-5 w-5/6 rounded mb-2"></div>
            <div className="animate-pulse bg-primary/10 h-5 w-3/6 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  let statusBadge;
  if (isTrialActive) {
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <Clock className="h-3 w-3 mr-1 text-amber-500" /> Trial
      </Badge>
    );
  } else if (subscription?.status === 'active') {
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <BadgeCheck className="h-3 w-3 mr-1 text-green-500" /> Pro Plan
      </Badge>
    );
  } else {
    statusBadge = (
      <Badge variant="outline" className="ml-auto text-destructive">
        <Clock className="h-3 w-3 mr-1" /> {subscription?.status === 'expired' ? 'Expired' : 'Free Plan'}
      </Badge>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your TaskPro subscription
            </CardDescription>
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrialActive && daysRemaining !== null && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Trial Period</span>
              <span className="text-sm text-muted-foreground">{daysRemaining} days left</span>
            </div>
            <Progress value={(daysRemaining / 14) * 100} className="h-2" />
          </div>
        )}

        {subscription?.status === 'active' && (
          <div className="flex items-center justify-between border rounded-md p-4 mb-4">
            <div>
              <h4 className="font-medium">Current Plan</h4>
              <p className="text-sm text-muted-foreground">
                TaskPro Pro ({subscription.plan_type === 'monthly' ? 'Monthly' : 'Yearly'})
              </p>
              {formattedExpiryDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Renews on {formattedExpiryDate}
                </p>
              )}
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>
        )}

        {subscription?.status === 'expired' && (
          <div className="flex items-center justify-between border rounded-md p-4 border-destructive/30 bg-destructive/5 mb-4">
            <div>
              <h4 className="font-medium text-destructive">Subscription Expired</h4>
              <p className="text-sm text-muted-foreground">
                Your subscription has expired. Renew now to continue using TaskPro Pro.
              </p>
            </div>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              Expired
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between border rounded-md p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <BadgeCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">TaskPro Pro</h4>
              <div className="text-sm text-muted-foreground">
                <p>Choose between:</p>
                <ul className="pl-4 mt-1 space-y-1">
                  <li>$3.00 per month</li>
                  <li>$30.00 per year (save 16%)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Unlimited projects and tasks</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Advanced filtering and sorting</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Priority customer support</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Theme customization</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span>Automatic renewal for uninterrupted service</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={onUpgrade} disabled={subscription?.status === 'active'}>
          <CreditCard className="mr-2 h-4 w-4" />
          {subscription?.status === 'active' 
            ? 'Currently Subscribed' 
            : isTrialActive 
              ? 'Upgrade to Pro' 
              : 'Subscribe Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}
