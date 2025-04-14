import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ConditionTypeSelector } from "./ConditionTypeSelector";
import { ConditionOperatorSelector } from "./ConditionOperatorSelector";
import { ConditionValueSelector } from "./ConditionValueSelector";

interface ConditionFormProps {
  conditionType: string;
  setConditionType: (value: string) => void;
  conditionOperator: string;
  setConditionOperator: (value: string) => void;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
  addCondition: () => void;
}

export function ConditionForm({
  conditionType,
  setConditionType,
  conditionOperator,
  setConditionOperator,
  conditionValue,
  setConditionValue,
  selectedDate,
  handleDateSelect,
  addCondition
}: ConditionFormProps) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="grid grid-cols-2 gap-4">
        <ConditionTypeSelector 
          conditionType={conditionType}
          onConditionTypeChange={(value) => {
            setConditionType(value);
            setConditionValue("");
          }}
        />
        <ConditionOperatorSelector
          conditionOperator={conditionOperator}
          setConditionOperator={setConditionOperator}
        />
      </div>

      <ConditionValueSelector
        conditionType={conditionType}
        conditionValue={conditionValue}
        setConditionValue={setConditionValue}
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
      />

      <Button
        type="button"
        onClick={addCondition}
        className="w-full mt-2"
        variant="outline"
      >
        <Plus className="mr-2 h-4 w-4" />
        Save Condition
      </Button>
    </div>
  );
}
