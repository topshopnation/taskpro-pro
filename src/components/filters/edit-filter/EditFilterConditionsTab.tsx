
import { FilterLogicSelector } from "./FilterLogicSelector";
import { CurrentConditionsList } from "./CurrentConditionsList";
import { AddConditionForm } from "./AddConditionForm";

interface EditFilterConditionsTabProps {
  filterConditions: any;
  handleLogicChange: (logic: string) => void;
  conditionType: string;
  setConditionType: (type: string) => void;
  conditionOperator: string;
  setConditionOperator: (operator: string) => void;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
  handleAddCondition: () => void;
  handleRemoveCondition: (index: number) => void;
  getConditionLabel: (condition: any) => string;
}

export function EditFilterConditionsTab({
  filterConditions,
  handleLogicChange,
  conditionType,
  setConditionType,
  conditionOperator,
  setConditionOperator,
  conditionValue,
  setConditionValue,
  selectedDate,
  handleDateSelect,
  handleAddCondition,
  handleRemoveCondition,
  getConditionLabel
}: EditFilterConditionsTabProps) {
  return (
    <div className="space-y-4">
      <FilterLogicSelector 
        logic={filterConditions.logic || "and"} 
        onLogicChange={handleLogicChange}
      />
      
      <CurrentConditionsList 
        conditions={filterConditions.items || []}
        getConditionLabel={getConditionLabel}
        removeCondition={handleRemoveCondition}
      />
      
      <AddConditionForm 
        conditionType={conditionType}
        setConditionType={setConditionType}
        conditionOperator={conditionOperator}
        setConditionOperator={setConditionOperator}
        conditionValue={conditionValue}
        setConditionValue={setConditionValue}
        selectedDate={selectedDate}
        handleDateSelect={handleDateSelect}
        addCondition={handleAddCondition}
      />
    </div>
  );
}
