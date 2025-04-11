
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateConditionValue } from "./DateConditionValue";
import { PriorityConditionValue } from "./PriorityConditionValue";
import { ProjectConditionValue } from "./ProjectConditionValue";

interface ConditionValueSelectorProps {
  conditionType: string;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
}

export function ConditionValueSelector({
  conditionType,
  conditionValue,
  setConditionValue,
  selectedDate,
  handleDateSelect
}: ConditionValueSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="condition-value">Value</Label>
      
      {conditionType === "due" ? (
        <DateConditionValue
          conditionValue={conditionValue}
          setConditionValue={setConditionValue}
          selectedDate={selectedDate}
          handleDateSelect={handleDateSelect}
        />
      ) : conditionType === "priority" ? (
        <PriorityConditionValue
          conditionValue={conditionValue}
          setConditionValue={setConditionValue}
        />
      ) : conditionType === "project" ? (
        <ProjectConditionValue
          conditionValue={conditionValue}
          setConditionValue={setConditionValue}
        />
      ) : (
        <Input
          id="condition-value-input"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          placeholder="Enter value"
        />
      )}
    </div>
  );
}
