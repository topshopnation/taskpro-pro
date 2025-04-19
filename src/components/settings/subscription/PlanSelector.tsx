
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlanSelectorProps {
  planType: "monthly" | "yearly";
  onPlanTypeChange: (planType: "monthly" | "yearly") => void;
}

export default function PlanSelector({ 
  planType, 
  onPlanTypeChange 
}: PlanSelectorProps) {
  const [subscriptionPrices, setSubscriptionPrices] = useState({
    monthly: 0,
    yearly: 0,
    yearlyDiscount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly, price_yearly')
          .eq('is_active', true)
          .single();

        if (error) throw error;

        if (data) {
          // Force recalculation with fresh data
          const monthly = data.price_monthly;
          const yearly = data.price_yearly;
          
          const calculatedDiscount = Math.round(
            ((monthly * 12 - yearly) / (monthly * 12)) * 100
          );
          
          setSubscriptionPrices({
            monthly,
            yearly,
            yearlyDiscount: calculatedDiscount
          });
          
          console.log("PlanSelector - calculated discount:", calculatedDiscount);
        }
      } catch (error) {
        console.error('Error fetching subscription prices:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPrices();
  }, []);

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
                <div className="font-semibold">${subscriptionPrices.monthly.toFixed(2)}/month</div>
                <div className="text-muted-foreground text-xs">Billed monthly</div>
              </div>
            </div>
            
            <div className="absolute -top-2 left-3 bg-muted-foreground/10 text-xs px-2 py-0.5 rounded text-muted-foreground">
              Standard
            </div>
          </div>
            
            <div className={`relative rounded-md border p-3 cursor-pointer ${planType === "yearly" ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`} onClick={() => onPlanTypeChange("yearly")}>
              <RadioGroupItem value="yearly" id="yearly" className="absolute right-3 top-3" />
              {subscriptionPrices.yearlyDiscount > 0 && (
                <div className="absolute -right-1 -top-3">
                  <div className="bg-primary flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm">
                    Save {subscriptionPrices.yearlyDiscount}%
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
                  <div className="font-semibold">${subscriptionPrices.yearly.toFixed(2)}/year</div>
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
