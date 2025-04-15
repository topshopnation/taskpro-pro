
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function SubscriptionStatus() {
  const { isActive, isTrialActive, daysRemaining, loading, fetchSubscription, initialized } = useSubscription();
  const [hasRendered, setHasRendered] = useState(false);

  // Ensure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("SubscriptionStatus: Fetching subscription data");
      fetchSubscription();
    }
  }, [fetchSubscription, loading, initialized]);
  
  // Use this effect to prevent flashing during initial load
  useEffect(() => {
    if (!loading && initialized) {
      setHasRendered(true);
    }
  }, [loading, initialized]);

  // Don't show anything during initial loading to prevent flickering
  if (!hasRendered || loading || !initialized) {
    return null;
  }

  if (!isActive && !isTrialActive) return null;

  return (
    <div className="flex items-center space-x-1">
      {isTrialActive && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1 text-amber-500" />
          Trial: {daysRemaining} days
        </Badge>
      )}
      {isActive && !isTrialActive && (
        <Badge variant="outline" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
          Active
        </Badge>
      )}
    </div>
  );
}
