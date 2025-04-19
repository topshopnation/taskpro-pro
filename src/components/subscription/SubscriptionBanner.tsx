
import { useSubscription } from "@/contexts/subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function SubscriptionBanner() {
  const { subscription, isActive, isTrialActive, daysRemaining } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchMonthlyPrice() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly')
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          setMonthlyPrice(data.price_monthly);
        }
      } catch (error) {
        console.error('Error fetching subscription price:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMonthlyPrice();
  }, []);
  
  // Show nothing if subscription is active, banner was dismissed, or prices are still loading
  if (isActive || dismissed || loading) return null;
  
  // Trial with less than 3 days remaining - show warning
  if (isTrialActive && daysRemaining <= 3) {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <AlertDescription className="text-sm">
              Your free trial ends in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. 
              Upgrade now to keep access to all features for only ${monthlyPrice}/month.
            </AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800"
              onClick={() => navigate('/settings')}
            >
              Upgrade
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-amber-800 hover:bg-amber-100"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>
    );
  }
  
  // Expired subscription - show error
  if (subscription?.status === 'expired' || subscription?.status === 'canceled') {
    return (
      <Alert className="mb-4 bg-destructive/10 border-destructive/20 text-destructive">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="text-sm">
              Your subscription has expired. Renew now for only ${monthlyPrice}/month to regain full access to TaskPro.
            </AlertDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-7"
              onClick={() => navigate('/settings')}
            >
              Renew Now
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>
    );
  }
  
  return null;
}
