
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  const [activePlan, setActivePlan] = useState<SubscriptionPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    }

    fetchActivePlan();
  }, []);

  if (isLoading || !activePlan) {
    return <div className="animate-pulse h-32 bg-muted rounded-md" />;
  }

  const yearlyDiscount = Math.round(((activePlan.price_monthly * 12 - activePlan.price_yearly) / (activePlan.price_monthly * 12)) * 100);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select your billing cycle</h3>
      
      <RadioGroup value={planType} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
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
                <div className="font-semibold">${activePlan.price_monthly.toFixed(2)}/month</div>
                <div className="text-muted-foreground text-xs">Billed monthly</div>
              </div>
            </div>
            
            <div className="absolute -top-2 left-3 bg-muted-foreground/10 text-xs px-2 py-0.5 rounded text-muted-foreground">
              Standard
            </div>
          </div>
            
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
                  <div className="font-semibold">${activePlan.price_yearly.toFixed(2)}/year</div>
                  <div className="text-muted-foreground text-xs">Billed annually</div>
                </div>
              </div>
              
              <div className="absolute -top-2 left-3 bg-green-100 text-xs px-2 py-0.5 rounded text-green-700 dark:bg-green-900 dark:text-green-300">
                Best Value
              </div>
            </div>
        </div>
      </RadioGroup>
    </div>
  );
}
