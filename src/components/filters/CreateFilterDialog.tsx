
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FilterFormHeader } from "./create-filter/FilterFormHeader";
import { FilterNameInput } from "./create-filter/FilterNameInput";
import { CurrentConditionsList } from "./create-filter/CurrentConditionsList";
import { ConditionForm } from "./create-filter/ConditionForm";
import { ConditionLogicSelector } from "./create-filter/ConditionLogicSelector";
import { FilterDialogFooter } from "./create-filter/FilterDialogFooter";
import { useFilterForm } from "./create-filter/useFilterForm";

interface CreateFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFilterDialog({ open, onOpenChange }: CreateFilterDialogProps) {
  const {
    name,
    setName,
    conditions,
    logic,
    setLogic,
    isLoading,
    isNameError,
    conditionType,
    setConditionType,
    conditionValue,
    setConditionValue,
    conditionOperator,
    setConditionOperator,
    selectedDate,
    validateFilterName,
    handleDateSelect,
    addCondition,
    removeCondition,
    handleSubmit,
    getConditionLabel
  } = useFilterForm(open, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <FilterFormHeader />
        
        <div className="grid gap-4 py-4">
          <FilterNameInput
            name={name}
            setName={setName}
            isNameError={isNameError}
            validateFilterName={validateFilterName}
          />
          
          <CurrentConditionsList
            conditions={conditions}
            getConditionLabel={getConditionLabel}
            removeCondition={removeCondition}
          />
          
          <ConditionForm
            conditionType={conditionType}
            setConditionType={setConditionType}
            conditionOperator={conditionOperator}
            setConditionOperator={setConditionOperator}
            conditionValue={conditionValue}
            setConditionValue={setConditionValue}
            selectedDate={selectedDate}
            handleDateSelect={handleDateSelect}
            addCondition={addCondition}
          />

          <ConditionLogicSelector
            logic={logic}
            setLogic={setLogic}
            showLogicSelector={conditions.length > 1}
          />
        </div>

        <FilterDialogFooter
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
