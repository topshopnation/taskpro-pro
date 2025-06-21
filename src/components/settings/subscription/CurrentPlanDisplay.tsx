
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription } from "@/contexts/subscription";
import { format, differenceInDays } from "date-fns";

export function CurrentPlanDisplay() {
  const { subscription, isTrialActive, daysRemaining, loading } = useSubscription();

  if (loading) {
    return (
      <div className="animate-pulse border rounded-md p-3 mb-2">
        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  // Determine current status
  const getCurrentStatus = () => {
    if (isTrialActive) {
      const isExpiringSoon = daysRemaining <= 3;
      return {
        planName: "Free Trial",
        statusBadge: isExpiringSoon ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            {daysRemaining} days left
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active Trial
          </Badge>
        ),
        details: `${daysRemaining} days remaining`,
        isExpired: false,
        hasAutoRenewal: false
      };
    }

    if (subscription?.status === 'active') {
      const hasAutoRenewal = subscription.paypal_subscription_id;
      const currentDate = new Date();
      const endDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      const isExpired = endDate && endDate < currentDate;
      const daysUntilExpiry = endDate ? differenceInDays(endDate, currentDate) : 0;
      const isExpiringSoon = daysUntilExpiry <= 14 && daysUntilExpiry > 0;

      if (isExpired) {
        return {
          planName: "Subscription Expired",
          statusBadge: (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          ),
          details: endDate ? `Expired on ${format(endDate, 'MMM d, yyyy')}` : 'Expired',
          isExpired: true,
          hasAutoRenewal: false
        };
      }

      return {
        planName: subscription.plan_type === 'monthly' ? "TaskPro Pro Monthly" : "TaskPro Pro Annual",
        statusBadge: hasAutoRenewal ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <RefreshCw className="h-3 w-3 mr-1" />
            Auto-Renewing
          </Badge>
        ) : isExpiringSoon ? (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Expires Soon
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        ),
        details: endDate ? (
          hasAutoRenewal 
            ? `Auto-renews on ${format(endDate, 'MMM d, yyyy')}`
            : isExpiringSoon 
              ? `Expires ${format(endDate, 'MMM d, yyyy')} - Renew now!`
              : `Renews on ${format(endDate, 'MMM d, yyyy')}`
        ) : 'Active subscription',
        isExpired: false,
        hasAutoRenewal
      };
    }

    if (subscription?.status === 'expired') {
      const endDate = subscription.current_period_end ? new Date(subscription.current_period_end) : null;
      return {
        planName: "Subscription Expired",
        statusBadge: (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        ),
        details: endDate ? `Expired on ${format(endDate, 'MMM d, yyyy')}` : 'Subscription expired',
        isExpired: true,
        hasAutoRenewal: false
      };
    }

    if (subscription?.status === 'canceled') {
      return {
        planName: "Subscription Canceled",
        statusBadge: (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            Canceled
          </Badge>
        ),
        details: 'Your subscription has been canceled',
        isExpired: true,
        hasAutoRenewal: false
      };
    }

    return {
      planName: "No Active Subscription",
      statusBadge: (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted-foreground/30">
          Inactive
        </Badge>
      ),
      details: 'Get started with a subscription',
      isExpired: false,
      hasAutoRenewal: false
    };
  };

  const status = getCurrentStatus();

  return (
    <div className="space-y-3">
      {/* Current Plan Status */}
      <div className="flex items-center justify-between border rounded-md p-3">
        <div>
          <h4 className="text-sm font-medium">Current Plan</h4>
          <p className="text-sm text-muted-foreground">{status.planName}</p>
          <p className="text-xs text-muted-foreground mt-1">{status.details}</p>
        </div>
        {status.statusBadge}
      </div>

      {/* Auto-renewal info */}
      {status.hasAutoRenewal && (
        <Alert className="border-green-200 bg-green-50">
          <RefreshCw className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <span className="font-medium">Auto-renewal active</span>
            <br />
            Your subscription will automatically renew through PayPal
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
