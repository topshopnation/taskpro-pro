import { useSubscription } from "@/contexts/subscription";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function SubscriptionStatus() {
  const { isActive, isTrialActive, subscription, loading, daysRemaining } = useSubscription();
  const navigate = useNavigate();
  
  if (loading) return null;
  
  // If not in trial or no subscription info, don't show anything
  if (!subscription || (!isTrialActive && isActive)) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={isTrialActive ? "outline" : "destructive"} 
            size="sm" 
            className="hidden md:flex items-center gap-1"
            onClick={() => navigate('/settings')}
          >
            <Clock className="h-3 w-3" />
            {isTrialActive ? (
              <span>Trial: {daysRemaining} days left</span>
            ) : (
              <span>Subscription Expired</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isTrialActive 
            ? "Your free trial is active. Click to upgrade for $3/month." 
            : "Your subscription has expired. Click to renew for $3/month."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
