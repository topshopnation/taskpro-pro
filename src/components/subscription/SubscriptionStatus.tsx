
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export function SubscriptionStatus() {
  const { isActive, isTrialActive, daysRemaining, loading, fetchSubscription, initialized } = useSubscription();

  // Ensure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("SubscriptionStatus: Fetching subscription data");
      fetchSubscription();
    }
  }, [fetchSubscription, loading, initialized]);

  // Don't show anything while loading to prevent flickering
  if (loading || !initialized) {
    return null; // Hide completely during loading instead of showing "Loading..."
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
