
import { ConditionTypeSelector } from "../ConditionTypeSelector";
import { ConditionOperatorSelector } from "../ConditionOperatorSelector";

interface ConditionSelectorsProps {
  conditionType: string;
  onConditionTypeChange: (value: string) => void;
  conditionOperator: string;
  setConditionOperator: (value: string) => void;
}

export function ConditionSelectors({
  conditionType,
  onConditionTypeChange,
  conditionOperator,
  setConditionOperator
}: ConditionSelectorsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ConditionTypeSelector 
        conditionType={conditionType}
        onConditionTypeChange={onConditionTypeChange}
      />
      <ConditionOperatorSelector
        conditionOperator={conditionOperator}
        setConditionOperator={setConditionOperator}
      />
    </div>
  );
}
