
import { ConditionValueSelector } from "./ConditionValueSelector";
import { ConditionSelectors } from "./components/ConditionSelectors";
import { SaveConditionButton } from "./components/SaveConditionButton";

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
  const handleConditionTypeChange = (value: string) => {
    setConditionType(value);
    setConditionValue("");
  };

  return (
    <div className="space-y-3 rounded-md border p-4">
      <ConditionSelectors
        conditionType={conditionType}
        onConditionTypeChange={handleConditionTypeChange}
        conditionOperator={conditionOperator}
        setConditionOperator={setConditionOperator}
      />

      <ConditionValueSelector
        conditionType={conditionType}
        conditionValue={conditionValue}
        setConditionValue={setConditionValue}
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
      />

      <SaveConditionButton onClick={addCondition} />
    </div>
  );
}
