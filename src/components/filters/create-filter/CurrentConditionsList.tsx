
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface Condition {
  id: string;
  type: string;
  value: string;
  operator?: string;
}

interface CurrentConditionsListProps {
  conditions: Condition[];
  getConditionLabel: (condition: Condition) => string;
  removeCondition: (id: string) => void;
}

export function CurrentConditionsList({
  conditions,
  getConditionLabel,
  removeCondition
}: CurrentConditionsListProps) {
  if (conditions.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>Current Conditions</Label>
      <div className="flex flex-wrap gap-2">
        {conditions.map((condition) => (
          <Badge 
            key={condition.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {getConditionLabel(condition)}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1"
              onClick={() => removeCondition(condition.id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
