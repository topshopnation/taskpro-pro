
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
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
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    );
  }

  // Determine if subscription is expired based on date comparison
  const currentDate = new Date();
  const expiryDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end) 
    : null;
  const isExpired = expiryDate && expiryDate < currentDate;
  
  // Check if subscription expires within 14 days
  const isExpiringSoon = subscription?.status === 'active' && (() => {
    try {
      const endDate = new Date(subscription.current_period_end ?? '');
      const now = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
    } catch (err) {
      console.error("Error calculating expiry status:", err);
      return false;
    }
  })();
  
  // Determine proper plan name and status badge based on subscription state
  let planName: string;
  let statusElement: React.ReactNode;
  let statusMessage: string | null = null;
  
  if (isTrialActive) {
    planName = "Free Trial";
    if (daysRemaining > 3) {
      statusElement = (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
          Active Trial
        </Badge>
      );
      statusMessage = `${daysRemaining} days remaining`;
    } else {
      statusElement = (
        <div className="flex flex-col items-end">
          <span className="text-xs text-amber-600 font-medium mb-0.5">{daysRemaining} days left</span>
          <Progress value={(daysRemaining / 14) * 100} className="h-1.5 w-20" />
        </div>
      );
    }
  } else if (subscription?.status === 'active' && !isExpired) {
    planName = subscription.plan_type === 'monthly' ? "TaskPro Pro Monthly" : "TaskPro Pro Annual";
    if (isExpiringSoon) {
      statusElement = (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
          Expires Soon
        </Badge>
      );
    } else {
      statusElement = (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
          Active
        </Badge>
      );
    }
  } else if (isExpired || subscription?.status === 'expired') {
    planName = "Subscription Expired";
    statusElement = (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
        Expired
      </Badge>
    );
  } else if (subscription?.status === 'canceled') {
    planName = "Subscription Canceled";
    statusElement = (
      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
        Canceled
      </Badge>
    );
  } else {
    planName = "No Active Subscription";
    statusElement = (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30 text-xs">
        Inactive
      </Badge>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded-md p-3 mb-2">
      <div>
        <h4 className="text-xs font-medium">Current Plan</h4>
        <p className="text-xs text-muted-foreground">{planName}</p>
        {statusMessage && (
          <p className="text-xs text-muted-foreground mt-0.5">{statusMessage}</p>
        )}
        {(formattedExpiryDate || (subscription?.status === 'expired' && subscription?.current_period_end)) && !statusMessage && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {subscription?.status === 'active' && !isExpired
              ? isExpiringSoon
                ? `Expires ${formattedExpiryDate} - Renew now!`
                : `Renews on ${formattedExpiryDate}`
              : isExpired || subscription?.status === 'expired'
                ? `Expired on ${
                    formattedExpiryDate || 
                    (subscription?.current_period_end 
                      ? format(new Date(subscription.current_period_end), "MMM d, yyyy") 
                      : 'Unknown Date')
                  }`
                : `Ended on ${formattedExpiryDate}`
            }
          </p>
        )}
      </div>
      {statusElement}
    </div>
  );
}
