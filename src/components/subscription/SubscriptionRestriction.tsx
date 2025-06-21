
import { useSubscription } from "@/contexts/subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface SubscriptionRestrictionProps {
  children: React.ReactNode;
}

export function SubscriptionRestriction({ children }: SubscriptionRestrictionProps) {
  const { isActive, isTrialActive, subscription, loading, daysRemaining, initialized } = useSubscription();
  const navigate = useNavigate();

  // Always show content while loading or not initialized
  if (loading || !initialized) {
    return <>{children}</>;
  }

  // If user has active subscription OR active trial, show the regular content
  if (isActive || isTrialActive) {
    return <>{children}</>;
  }

  // Only show restriction if we're absolutely sure user doesn't have access
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
        <Alert className="bg-white/95 border border-purple-200 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-purple-500" />
          <AlertTitle className="text-xl text-purple-700">Subscription Required</AlertTitle>
          <AlertDescription className="mt-2 text-gray-600">
            {subscription?.status === 'trial' && daysRemaining <= 0 ? (
              <span>Your free trial has expired. Subscribe now to continue using all TaskPro features.</span>
            ) : subscription?.status === 'expired' ? (
              <span>Your subscription has expired. Please renew to continue using TaskPro.</span>
            ) : subscription?.status === 'canceled' ? (
              <span>Your subscription has been canceled. Reactivate your subscription to continue using TaskPro.</span>
            ) : (
              <span>Start your free 14-day trial to access all TaskPro features. No payment required upfront!</span>
            )}
            <div className="mt-4">
              <Button 
                onClick={() => navigate('/settings')} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white"
                variant="default"
              >
                Start Free Trial
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
