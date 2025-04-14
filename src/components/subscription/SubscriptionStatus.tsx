
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function SubscriptionStatus() {
  const { isActive, isTrialActive, daysRemaining, loading } = useSubscription();

  if (loading) return null;

  if (!isActive && !isTrialActive) return null;

  return (
    <div className="flex items-center space-x-1">
      {isTrialActive && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Trial: {daysRemaining} days
        </Badge>
      )}
    </div>
  );
}
