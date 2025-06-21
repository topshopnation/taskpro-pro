
import { Check } from "lucide-react";

const features = [
  "Unlimited projects and tasks",
  "Advanced filtering and sorting", 
  "Priority customer support",
  "Theme customization",
  "Automatic renewal for uninterrupted service"
];

export function SubscriptionFeatures() {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground">Included Features:</h4>
      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
