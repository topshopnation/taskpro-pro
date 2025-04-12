
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditFilterBasicsTab } from "./EditFilterBasicsTab";
import { EditFilterConditionsTab } from "./EditFilterConditionsTab";

interface EditFilterTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filterName: string;
  onFilterNameChange: (name: string) => void;
  filterColor: string;
  onFilterColorChange: (color: string) => void;
  filterColors: string[];
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

export function EditFilterTabs({
  activeTab,
  setActiveTab,
  filterName,
  onFilterNameChange,
  filterColor,
  onFilterColorChange,
  filterColors,
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
}: EditFilterTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basics">Basic Info</TabsTrigger>
        <TabsTrigger value="conditions">Conditions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basics" className="space-y-4 py-4">
        <EditFilterBasicsTab 
          filterName={filterName}
          onFilterNameChange={onFilterNameChange}
          filterColor={filterColor}
          onFilterColorChange={onFilterColorChange}
          filterColors={filterColors}
        />
      </TabsContent>
      
      <TabsContent value="conditions" className="space-y-4 py-4">
        <EditFilterConditionsTab
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
          getConditionLabel={getConditionLabel}
        />
      </TabsContent>
    </Tabs>
  );
}
