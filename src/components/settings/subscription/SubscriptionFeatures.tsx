
import { BadgeCheck } from "lucide-react";

export function SubscriptionFeatures() {
  return (
    <ul className="space-y-1.5 pl-0.5">
      <li className="flex items-center gap-1.5 text-xs">
        <BadgeCheck className="h-3 w-3 text-green-500" />
        <span>Unlimited projects and tasks</span>
      </li>
      <li className="flex items-center gap-1.5 text-xs">
        <BadgeCheck className="h-3 w-3 text-green-500" />
        <span>Advanced filtering and sorting</span>
      </li>
      <li className="flex items-center gap-1.5 text-xs">
        <BadgeCheck className="h-3 w-3 text-green-500" />
        <span>Priority customer support</span>
      </li>
      <li className="flex items-center gap-1.5 text-xs">
        <BadgeCheck className="h-3 w-3 text-green-500" />
        <span>Theme customization</span>
      </li>
      <li className="flex items-center gap-1.5 text-xs">
        <BadgeCheck className="h-3 w-3 text-green-500" />
        <span>Automatic renewal for uninterrupted service</span>
      </li>
    </ul>
  );
}
