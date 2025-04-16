import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Subscription } from "@/contexts/subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubscriptionStatusProps {
  subscription: Subscription | null;
  isTrialActive: boolean;
  daysRemaining: number;
  formattedExpiryDate: string | null;
  error?: string | null;
}

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

  let planName = "";
  let statusBadge;
  
  if (isTrialActive) {
    planName = "Trial Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <Clock className="h-3 w-3 mr-1 text-amber-500" /> Trial
      </Badge>
    );
  } else if (subscription?.status === 'active') {
    planName = subscription.plan_type === 'monthly' ? "Monthly Subscription" : "Annual Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <BadgeCheck className="h-3 w-3 mr-1 text-green-500" /> Active
      </Badge>
    );
  } else {
    planName = "No Active Subscription";
    statusBadge = (
      <Badge variant="outline" className="ml-auto">
        <Clock className="h-3 w-3 mr-1" /> Inactive
      </Badge>
    );
  }

  return (
    <div className="flex items-center justify-between border rounded-md p-3 mb-2">
      <div>
        <h4 className="text-xs font-medium">Current Plan</h4>
        <p className="text-xs text-muted-foreground">{planName}</p>
        {formattedExpiryDate && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {isTrialActive ? "Trial ends" : subscription?.status === 'active' ? "Renews" : "Expired"} on {formattedExpiryDate}
          </p>
        )}
      </div>
      {isTrialActive && (
        <div className="flex flex-col items-end">
          <span className="text-xs text-amber-600 font-medium mb-0.5">{daysRemaining} days left</span>
          <Progress value={(daysRemaining / 14) * 100} className="h-1.5 w-20" />
        </div>
      )}
      {subscription?.status === 'active' && (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
          Active
        </Badge>
      )}
      {subscription?.status === 'expired' && (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
          Expired
        </Badge>
      )}
    </div>
  );
}
