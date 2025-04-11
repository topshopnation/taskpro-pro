
import { useSubscription } from "@/contexts/subscription-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface SubscriptionRestrictionProps {
  children: React.ReactNode;
}

export function SubscriptionRestriction({ children }: SubscriptionRestrictionProps) {
  const { isActive, subscription, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return <>{children}</>;
  }

  // If subscription is active, show the regular content
  if (isActive) {
    return <>{children}</>;
  }

  // If subscription is not active, show restricted view
  return (
    <div className="relative">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>
      
      {/* Blurred content */}
      <div className="pointer-events-none blur-sm opacity-50">
        {children}
      </div>
      
      {/* Subscription alert */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md">
        <Alert variant="destructive" className="bg-background border-2 shadow-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-xl">Subscription Required</AlertTitle>
          <AlertDescription className="mt-2">
            {subscription?.status === 'trial' && subscription.daysRemaining !== null && subscription.daysRemaining <= 0 ? (
              <span>Your free trial has expired. Upgrade now to continue using TaskPro.</span>
            ) : subscription?.status === 'expired' ? (
              <span>Your subscription has expired. Please renew to continue using TaskPro.</span>
            ) : subscription?.status === 'canceled' ? (
              <span>Your subscription has been canceled. Reactivate your subscription to continue using TaskPro.</span>
            ) : (
              <span>A subscription is required to use this feature.</span>
            )}
            <div className="mt-4">
              <Button 
                onClick={() => navigate('/settings')} 
                className="w-full"
                variant="default"
              >
                View Subscription Options
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
