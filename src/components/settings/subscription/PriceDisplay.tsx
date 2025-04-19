
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface PriceDisplayProps {
  planType: "monthly" | "yearly";
}

export default function PriceDisplay({ planType }: PriceDisplayProps) {
  const [prices, setPrices] = useState<{ monthly: number; yearly: number }>({ monthly: 0, yearly: 0 });
  const [loading, setLoading] = useState(true);

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
          setPrices({
            monthly: data.price_monthly,
            yearly: data.price_yearly
          });
        }
      } catch (error) {
        console.error('Error fetching subscription prices:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-16 bg-muted rounded-md" />;
  }

  if (planType === "monthly") {
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">${prices.monthly.toFixed(2)}<span className="text-sm font-normal">/month</span></span>
        <Badge variant="outline" className="mt-2 w-fit">
          Billed monthly
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews monthly</span>
      </div>
    );
  } else {
    const yearlyDiscount = Math.round(((prices.monthly * 12 - prices.yearly) / (prices.monthly * 12)) * 100);
    
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">${prices.yearly.toFixed(2)}<span className="text-sm font-normal">/year</span></span>
        <Badge variant="secondary" className="mt-2 w-fit">
          Save {yearlyDiscount}%
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews yearly</span>
      </div>
    );
  }
}
