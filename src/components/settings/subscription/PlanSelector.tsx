
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, BadgeCheck } from "lucide-react";
import { subscriptionPlanService, SubscriptionPlanData } from "@/services/subscriptionPlanService";

interface PlanSelectorProps {
  planType: "monthly" | "yearly";
  onPlanTypeChange: (planType: "monthly" | "yearly") => void;
}

export default function PlanSelector({ 
  planType, 
  onPlanTypeChange 
}: PlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        setError(null);
        console.log("PlanSelector: Fetching plans...");
        
        const availablePlans = await subscriptionPlanService.getActivePlans();
        console.log("PlanSelector: Got plans:", availablePlans);
        
        if (availablePlans.length === 0) {
          setError("No subscription plans are currently available. Please contact support.");
        } else {
          setPlans(availablePlans);
        }
      } catch (error: any) {
        console.error('PlanSelector: Error fetching plans:', error);
        setError(`Failed to load plans: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-32 bg-muted rounded-md" />;
  }

  if (error || plans.length === 0) {
    return (
      <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-md">
        <p className="text-sm text-destructive">
          {error || "No subscription plans available"}
        </p>
      </div>
    );
  }

  // Use the first plan for pricing
  const plan = plans[0];
  const yearlyDiscount = plan.price_yearly > 0 && plan.price_monthly > 0 
    ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select your billing cycle</h3>
      
      <RadioGroup value={planType} onValueChange={(value) => onPlanTypeChange(value as "monthly" | "yearly")}>
        <div className="grid grid-cols-2 gap-4">
          {/* Monthly Option */}
          {plan.price_monthly > 0 && (
            <div className={`relative rounded-md border p-3 cursor-pointer ${planType === "monthly" ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`} onClick={() => onPlanTypeChange("monthly")}>
              <RadioGroupItem value="monthly" id="monthly" className="absolute right-3 top-3" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="monthly" className="font-medium">Monthly</Label>
                  {planType === "monthly" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">${plan.price_monthly.toFixed(2)}/month</div>
                  <div className="text-muted-foreground text-xs">Billed monthly</div>
                </div>
              </div>
            </div>
          )}
            
          {/* Yearly Option */}
          {plan.price_yearly > 0 && (
            <div className={`relative rounded-md border p-3 cursor-pointer ${planType === "yearly" ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`} onClick={() => onPlanTypeChange("yearly")}>
              <RadioGroupItem value="yearly" id="yearly" className="absolute right-3 top-3" />
              {yearlyDiscount > 0 && (
                <div className="absolute -right-1 -top-3">
                  <div className="bg-primary flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm">
                    Save {yearlyDiscount}%
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="yearly" className="font-medium">Yearly</Label>
                  {planType === "yearly" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">${plan.price_yearly.toFixed(2)}/year</div>
                  <div className="text-muted-foreground text-xs">Billed annually</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Plan Features */}
      {plan.features && plan.features.length > 0 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <h4 className="text-sm font-medium mb-2">{plan.name} includes:</h4>
          <ul className="text-xs space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <BadgeCheck className="h-3 w-3 text-green-600" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
