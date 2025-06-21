
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { subscriptionPlanService, SubscriptionPlanData } from "@/services/subscriptionPlanService";

interface PriceDisplayProps {
  planType: "monthly" | "yearly";
}

export default function PriceDisplay({ planType }: PriceDisplayProps) {
  const [activePlan, setActivePlan] = useState<SubscriptionPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivePlan() {
      try {
        const plan = await subscriptionPlanService.getActivePlan();
        if (plan) {
          setActivePlan(plan);
        } else {
          // Fallback to default pricing
          setActivePlan({
            id: 'default',
            name: 'TaskPro Pro',
            description: '',
            price_monthly: 9.99,
            price_yearly: 99.99,
            features: [],
            is_active: true
          });
        }
      } catch (error) {
        console.error('Error fetching subscription plan:', error);
        // Fallback to default pricing
        setActivePlan({
          id: 'default',
          name: 'TaskPro Pro',
          description: '',
          price_monthly: 9.99,
          price_yearly: 99.99,
          features: [],
          is_active: true
        });
      } finally {
        setLoading(false);
      }
    }

    fetchActivePlan();
  }, []);

  if (loading || !activePlan) {
    return <div className="animate-pulse h-16 bg-muted rounded-md" />;
  }

  if (planType === "monthly") {
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">${activePlan.price_monthly.toFixed(2)}<span className="text-sm font-normal">/month</span></span>
        <Badge variant="outline" className="mt-2 w-fit">
          Billed monthly
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews monthly</span>
      </div>
    );
  } else {
    const yearlyDiscount = Math.round(((activePlan.price_monthly * 12 - activePlan.price_yearly) / (activePlan.price_monthly * 12)) * 100);
    
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">${activePlan.price_yearly.toFixed(2)}<span className="text-sm font-normal">/year</span></span>
        <Badge variant="secondary" className="mt-2 w-fit">
          Save {yearlyDiscount}%
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews yearly</span>
      </div>
    );
  }
}
