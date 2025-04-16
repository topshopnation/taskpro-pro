
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function SubscriptionStatus() {
  const { isActive, isTrialActive, daysRemaining, loading, fetchSubscription, initialized } = useSubscription();
  const [isLoaded, setIsLoaded] = useState(false);

  // Ensure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("SubscriptionStatus: Fetching subscription data");
      fetchSubscription();
    }
  }, [fetchSubscription, loading, initialized]);
  
  // Add a small delay before showing subscription status to prevent flickering
  useEffect(() => {
    if (!loading && initialized) {
      // Small delay to ensure stable rendering
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 200); // Increased delay for more stability
      
      return () => clearTimeout(timer);
    }
  }, [loading, initialized]);
  
  // Don't show anything during initial loading to prevent flickering
  if (!isLoaded) {
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
