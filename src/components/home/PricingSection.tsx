import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const PricingSection = () => {
  const navigate = useNavigate();
  const [subscriptionPrices, setSubscriptionPrices] = useState({
    monthly: 0,
    yearly: 0,
    yearlyDiscount: 0
  });
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionPrices() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('price_monthly, price_yearly')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching subscription prices:', error);
          return;
        }

        if (data) {
          console.log("Fetched subscription prices for home page:", data);
          const yearlyDiscount = Math.round(((data.price_monthly * 12 - data.price_yearly) / (data.price_monthly * 12)) * 100);
          
          setSubscriptionPrices({
            monthly: data.price_monthly,
            yearly: data.price_yearly,
            yearlyDiscount
          });
        }
      } catch (error) {
        console.error('Error in subscription price fetch:', error);
      } finally {
        setPricesLoading(false);
      }
    }

    fetchSubscriptionPrices();
  }, []);

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing for Everyone</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Unlock premium features with our affordable plans.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg overflow-hidden border-2 border-primary">
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
              {pricesLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <span className="text-5xl font-bold">${subscriptionPrices.monthly}</span>
                    <span className="text-xl ml-1 text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Billed monthly or ${subscriptionPrices.yearly} annually
                    {subscriptionPrices.yearlyDiscount > 0 && (
                      <span className="ml-1">(save {subscriptionPrices.yearlyDiscount}%)</span>
                    )}
                  </p>
                </>
              )}
            </div>
            <div className="p-8 bg-gray-50 dark:bg-gray-900">
              <ul className="space-y-4">
                {[
                  "Unlimited tasks and projects",
                  "Custom filters and favorites",
                  "Priority task management",
                  "Analytics and reports"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8 h-12" size="lg" onClick={() => navigate("/auth")}>
                Start Free Trial
              </Button>
              <p className="text-sm text-center mt-4 text-gray-500">No credit card required</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
