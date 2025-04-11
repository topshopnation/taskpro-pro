
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConditionLogicSelectorProps {
  logic: string;
  setLogic: (value: string) => void;
  showLogicSelector: boolean;
}

export function ConditionLogicSelector({
  logic,
  setLogic,
  showLogicSelector
}: ConditionLogicSelectorProps) {
  if (!showLogicSelector) return null;
  
  return (
    <div className="grid gap-2">
      <Label>Condition Logic</Label>
      <RadioGroup 
        value={logic} 
        onValueChange={setLogic}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="and" id="logic-and" />
          <Label htmlFor="logic-and">Match ALL conditions (AND)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="or" id="logic-or" />
          <Label htmlFor="logic-or">Match ANY condition (OR)</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
