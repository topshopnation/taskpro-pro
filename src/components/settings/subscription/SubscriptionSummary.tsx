
import { CalendarDays } from "lucide-react";
import PriceDisplay from "./PriceDisplay";

interface SubscriptionSummaryProps {
  planType: "monthly" | "yearly";
}

export default function SubscriptionSummary({ planType }: SubscriptionSummaryProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">TaskPro {planType === "monthly" ? "Monthly" : "Annual"} Plan</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>Auto-renews {planType === "monthly" ? "monthly" : "yearly"}</span>
          </div>
        </div>
        <PriceDisplay planType={planType} />
      </div>
    </div>
  );
}
