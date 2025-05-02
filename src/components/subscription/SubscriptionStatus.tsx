
import { useSubscription } from "@/contexts/subscription";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function SubscriptionStatus() {
  const { 
    isActive, 
    isTrialActive, 
    daysRemaining, 
    subscription, 
    loading, 
    fetchSubscription, 
    initialized 
  } = useSubscription();
  const [isLoaded, setIsLoaded] = useState(false);
  const fetchAttempted = useRef(false);
  const navigate = useNavigate();

  // Ensure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized && !fetchAttempted.current) {
      console.log("SubscriptionStatus: Fetching subscription data");
      fetchAttempted.current = true;
      fetchSubscription();
    }
  }, [fetchSubscription, loading, initialized]);
  
  // Add a longer delay before showing subscription status to prevent flickering
  useEffect(() => {
    if (!loading && initialized) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, initialized]);
  
  // Don't show anything during initial loading to prevent flickering
  if (!isLoaded) {
    return null;
  }

  // Calculate if subscription is expiring soon (within 14 days)
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

  // Determine if subscription is expired
  const isExpired = subscription?.status === 'expired' || 
    (subscription?.current_period_end && new Date(subscription.current_period_end) < new Date());

  // Only show status if trial, inactive, expired, or expiring soon
  if (!isTrialActive && isActive && !isExpiringSoon && !isExpired) {
    return null;
  }

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <div className="flex items-center space-x-1">
      {isTrialActive && (
        <Badge variant="outline" className="text-xs">
          <Clock className="h-3 w-3 mr-1 text-amber-500" />
          Trial: {daysRemaining} days
        </Badge>
      )}
      {isExpired && (
        <Badge 
          variant="outline" 
          className="text-xs cursor-pointer hover:bg-destructive/10"
          onClick={handleClick}
        >
          <AlertTriangle className="h-3 w-3 mr-1 text-destructive" />
          Expired
        </Badge>
      )}
      {!isActive && !isTrialActive && !isExpired && (
        <Badge 
          variant="outline" 
          className="text-xs cursor-pointer hover:bg-destructive/10"
          onClick={handleClick}
        >
          <AlertTriangle className="h-3 w-3 mr-1 text-destructive" />
          Inactive
        </Badge>
      )}
      {isExpiringSoon && (
        <Badge 
          variant="outline" 
          className="text-xs cursor-pointer hover:bg-amber-50"
          onClick={handleClick}
        >
          <Clock className="h-3 w-3 mr-1 text-amber-500" />
          Expiring Soon
        </Badge>
      )}
    </div>
  );
}
