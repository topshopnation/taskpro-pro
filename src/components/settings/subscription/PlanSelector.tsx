import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlanSelectorProps {
  planType: "monthly" | "yearly";
  onPlanTypeChange: (planType: "monthly" | "yearly") => void;
}

export default function PlanSelector({ planType, onPlanTypeChange }: PlanSelectorProps) {
  const [plan, setPlan] = useState<{
    price_monthly: number;
    price_yearly: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly, price_yearly')
          .eq('is_active', true)
          .single();
        
        if (error) throw error;
        setPlan(data);
      } catch (error) {
        console.error("Error fetching subscription plan:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, []);
  
  const yearlyDiscount = plan ? 
    Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100) : 0;
  
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4 space-y-3">
          <div className="h-6 w-1/3 bg-muted rounded"></div>
          <div className="h-16 w-full bg-muted rounded"></div>
          <div className="h-16 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!plan) {
    return null;
  }
  
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <RadioGroup value={planType} onValueChange={(value) => onPlanTypeChange(value as "monthly" | "yearly")} className="space-y-2">
          <div className="flex flex-col space-y-3">
            <div className={`relative rounded-md border p-3 cursor-pointer ${planType === "monthly" ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`} onClick={() => onPlanTypeChange("monthly")}>
              <RadioGroupItem value="monthly" id="monthly" className="absolute right-3 top-3" />
              <div className="pr-7">
                <div className="flex items-center">
                  <Label htmlFor="monthly" className="font-medium text-sm">Monthly</Label>
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-2xl font-bold">${plan.price_monthly.toFixed(2)}</span>
                  <span className="ml-1 text-muted-foreground text-sm">/ month</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Billed monthly. Cancel anytime.</div>
              </div>
            </div>
            
            <div className={`relative rounded-md border p-3 cursor-pointer ${planType === "yearly" ? "border-primary bg-primary/10" : "border-muted-foreground/20"}`} onClick={() => onPlanTypeChange("yearly")}>
              <RadioGroupItem value="yearly" id="yearly" className="absolute right-3 top-3" />
              {yearlyDiscount > 0 && (
                <div className="absolute -right-1 -top-3">
                  <div className="bg-primary flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm">
                    <Sparkles className="mr-0.5 h-3 w-3" />
                    Save {yearlyDiscount}%
                  </div>
                </div>
              )}
              <div className="pr-7">
                <div className="flex items-center">
                  <Label htmlFor="yearly" className="font-medium text-sm">Yearly</Label>
                </div>
                <div className="mt-1 flex items-baseline">
                  <span className="text-2xl font-bold">${plan?.price_yearly.toFixed(2)}</span>
                  <span className="ml-1 text-muted-foreground text-sm">/ year</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Billed annually. Only ${plan ? (plan.price_yearly / 12).toFixed(2) : '0'} per month.
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
