
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubscriptionStatusProps } from "@/types/subscriptionTypes";
import { format } from "date-fns";

export function SubscriptionStatus({ 
  subscription, 
  isTrialActive, 
  daysRemaining, 
  formattedExpiryDate,
  error
}: SubscriptionStatusProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Determine proper plan name and status badge based on subscription state
  let planName: string;
  let statusElement: React.ReactNode;
  
  if (isTrialActive) {
    planName = "Trial Subscription";
    statusElement = (
      <div className="flex flex-col items-end">
        <span className="text-xs text-amber-600 font-medium mb-0.5">{daysRemaining} days left</span>
        <Progress value={(daysRemaining / 14) * 100} className="h-1.5 w-20" />
      </div>
    );
  } else if (subscription?.status === 'active') {
    planName = subscription.plan_type === 'monthly' ? "Monthly Subscription" : "Annual Subscription";
    statusElement = (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
        Active
      </Badge>
    );
  } else if (subscription?.status === 'expired') {
    planName = "Expired Subscription";
    statusElement = (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
        Expired
      </Badge>
    );
  } else if (subscription?.status === 'canceled') {
    planName = "Canceled Subscription";
    statusElement = (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
        Canceled
      </Badge>
    );
  } else {
    planName = "No Active Subscription";
    statusElement = (
      <Badge variant="outline" className="text-muted-foreground text-xs">
        Inactive
      </Badge>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded-md p-3 mb-2">
      <div>
        <h4 className="text-xs font-medium">Current Plan</h4>
        <p className="text-xs text-muted-foreground">{planName}</p>
        {(formattedExpiryDate || (subscription?.status === 'expired' && subscription?.current_period_end)) && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {subscription?.status === 'active' 
              ? `License expires on ${formattedExpiryDate}`
              : subscription?.status === 'expired'
                ? `License expired on ${
                    formattedExpiryDate || 
                    (subscription?.current_period_end 
                      ? format(new Date(subscription.current_period_end), "MMM d, yyyy") 
                      : 'Unknown Date')
                  }`
                : isTrialActive
                  ? `Trial ends on ${formattedExpiryDate}`
                  : `Expired on ${formattedExpiryDate}`
            }
          </p>
        )}
      </div>
      {statusElement}
    </div>
  );
}
