
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConditionOperatorSelectorProps {
  conditionOperator: string;
  setConditionOperator: (value: string) => void;
}

export function ConditionOperatorSelector({
  conditionOperator,
  setConditionOperator
}: ConditionOperatorSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="condition-operator">Operator</Label>
      <Select value={conditionOperator} onValueChange={setConditionOperator}>
        <SelectTrigger id="condition-operator">
          <SelectValue placeholder="Select operator" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="equals">is</SelectItem>
          <SelectItem value="not_equals">is not</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
