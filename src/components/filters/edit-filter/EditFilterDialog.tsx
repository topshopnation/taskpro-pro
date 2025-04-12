
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useConditionLabels } from "./useConditionLabels";
import { EditFilterHeader } from "./EditFilterHeader";
import { EditFilterFooter } from "./EditFilterFooter";
import { EditFilterTabs } from "./EditFilterTabs";
import { useEditFilterForm } from "./useEditFilterForm";

interface EditFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filterName: string;
  filterColor: string;
  filterConditions: any;
  onFilterNameChange: (name: string) => void;
  onFilterColorChange: (color: string) => void;
  onFilterConditionsChange: (conditions: any) => void;
  onSave: () => void;
  isUpdating?: boolean;
}

export function EditFilterDialog({
  open,
  onOpenChange,
  filterName,
  filterColor,
  filterConditions,
  onFilterNameChange,
  onFilterColorChange,
  onFilterConditionsChange,
  onSave,
  isUpdating = false
}: EditFilterDialogProps) {
  const filterColors = [
    "#FF6B6B", "#FF9E7D", "#FFCA80", "#FFEC8A", "#BADA55", 
    "#7ED957", "#4ECDC4", "#45B7D1", "#4F86C6", "#5E60CE", 
    "#7950F2", "#9775FA", "#C77DFF", "#E77FF3", "#F26ABC", 
    "#F868B3", "#FF66A3", "#A1A09E", "#6D6A75", "#6C757D"
  ];

  const {
    activeTab,
    setActiveTab,
    conditionType,
    setConditionType,
    conditionValue,
    setConditionValue,
    conditionOperator,
    setConditionOperator,
    selectedDate,
    handleDateSelect,
    handleAddCondition,
    handleRemoveCondition,
    handleLogicChange,
    projects
  } = useEditFilterForm({
    open,
    filterName,
    filterColor,
    filterConditions,
    onFilterNameChange,
    onFilterColorChange,
    onFilterConditionsChange
  });
  
  const { getConditionLabel } = useConditionLabels();

  // Format condition for display
  const getFullConditionLabel = (condition: any) => {
    return getConditionLabel(condition, projects);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <EditFilterHeader />
        
        <EditFilterTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterName={filterName}
          onFilterNameChange={onFilterNameChange}
          filterColor={filterColor}
          onFilterColorChange={onFilterColorChange}
          filterColors={filterColors}
          filterConditions={filterConditions}
          handleLogicChange={handleLogicChange}
          conditionType={conditionType}
          setConditionType={setConditionType}
          conditionOperator={conditionOperator}
          setConditionOperator={setConditionOperator}
          conditionValue={conditionValue}
          setConditionValue={setConditionValue}
          selectedDate={selectedDate}
          handleDateSelect={handleDateSelect}
          handleAddCondition={handleAddCondition}
          handleRemoveCondition={handleRemoveCondition}
          getConditionLabel={getFullConditionLabel}
        />
        
        <EditFilterFooter 
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
          isUpdating={isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
}
