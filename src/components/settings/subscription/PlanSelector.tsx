
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PlanSelectorProps } from "@/types/subscriptionTypes";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from "@/types/adminTypes";

export default function PlanSelector({ planType, onPlanTypeChange }: PlanSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPlans(data);
        } else {
          // Fallback to default plans if none are in the database
          setPlans([
            {
              id: 'default-monthly',
              name: 'TaskPro Pro',
              description: 'All TaskPro features for monthly billing',
              price_monthly: 3,
              price_yearly: 0,
              features: [
                'Unlimited projects and tasks',
                'Advanced filtering capabilities',
                'Priority support',
                'All premium features'
              ],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'default-yearly',
              name: 'TaskPro Pro (Yearly)',
              description: 'All TaskPro features for yearly billing',
              price_monthly: 0,
              price_yearly: 30,
              features: [
                'All monthly features',
                'Save 16% compared to monthly',
                'Priority support',
                'All premium features'
              ],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        // Fallback to defaults
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  // Find plans appropriate for selected type
  const getRelevantPlans = () => {
    if (planType === 'monthly') {
      return plans.filter(plan => plan.price_monthly > 0);
    } else {
      return plans.filter(plan => plan.price_yearly > 0);
    }
  };

  const relevantPlans = getRelevantPlans();
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="monthly" value={planType} onValueChange={onPlanTypeChange as any}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly (Save 16%)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          {relevantPlans.length > 0 ? (
            relevantPlans.map(plan => (
              <Card key={plan.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 text-2xl font-bold">${plan.price_monthly.toFixed(2)}<span className="text-sm font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>TaskPro Pro</CardTitle>
                <CardDescription>All the essential features you need</CardDescription>
                <div className="mt-2 text-2xl font-bold">$3.00<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Unlimited projects and tasks</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Advanced filtering capabilities</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">All premium features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="yearly" className="space-y-4">
          {relevantPlans.length > 0 ? (
            relevantPlans.map(plan => (
              <Card key={plan.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 text-2xl font-bold">${plan.price_yearly.toFixed(2)}<span className="text-sm font-normal">/year</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>TaskPro Pro (Yearly)</CardTitle>
                <CardDescription>Save with yearly billing</CardDescription>
                <div className="mt-2 text-2xl font-bold">$30.00<span className="text-sm font-normal">/year</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">All monthly features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Save 16% compared to monthly</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">All premium features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
