
import { Label } from "@/components/ui/label";
import { ConditionBadge } from "./ConditionBadge";

interface CurrentConditionsListProps {
  conditions: any[];
  getConditionLabel: (condition: any) => string;
  removeCondition: (index: number) => void;
}

export function CurrentConditionsList({ 
  conditions, 
  getConditionLabel, 
  removeCondition 
}: CurrentConditionsListProps) {
  if (!conditions || conditions.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">No conditions added yet</div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Current Conditions</Label>
      <div className="flex flex-wrap gap-2">
        {conditions.map((condition, index) => (
          <ConditionBadge
            key={index}
            label={getConditionLabel(condition)}
            onRemove={() => removeCondition(index)}
          />
        ))}
      </div>
    </div>
  );
}
