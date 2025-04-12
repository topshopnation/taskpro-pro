
import { Badge } from "@/components/ui/badge";

interface PriceDisplayProps {
  planType: "monthly" | "yearly";
}

export default function PriceDisplay({ planType }: PriceDisplayProps) {
  if (planType === "monthly") {
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">$3.00<span className="text-sm font-normal">/month</span></span>
        <Badge variant="outline" className="mt-2 w-fit">
          Billed monthly
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews monthly</span>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col">
        <span className="text-2xl font-bold">$30.00<span className="text-sm font-normal">/year</span></span>
        <Badge variant="secondary" className="mt-2 w-fit">
          Save 16%
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">Auto-renews yearly</span>
      </div>
    );
  }
}
