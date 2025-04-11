
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PriorityConditionValueProps {
  conditionValue: string;
  setConditionValue: (value: string) => void;
}

export function PriorityConditionValue({
  conditionValue,
  setConditionValue
}: PriorityConditionValueProps) {
  return (
    <Select value={conditionValue} onValueChange={setConditionValue}>
      <SelectTrigger id="condition-value-select">
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Priority 1</SelectItem>
        <SelectItem value="2">Priority 2</SelectItem>
        <SelectItem value="3">Priority 3</SelectItem>
        <SelectItem value="4">Priority 4</SelectItem>
      </SelectContent>
    </Select>
  );
}
