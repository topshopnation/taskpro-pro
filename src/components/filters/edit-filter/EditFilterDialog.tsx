
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";
import { EditFilterHeader } from "./EditFilterHeader";
import { EditFilterBasicsTab } from "./EditFilterBasicsTab";
import { CurrentConditionsList } from "./CurrentConditionsList";
import { FilterLogicSelector } from "./FilterLogicSelector";
import { AddConditionForm } from "./AddConditionForm";
import { EditFilterFooter } from "./EditFilterFooter";
import { useConditionLabels } from "./useConditionLabels";

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

  const [activeTab, setActiveTab] = useState("basics");
  const [conditionType, setConditionType] = useState("due");
  const [conditionValue, setConditionValue] = useState("");
  const [conditionOperator, setConditionOperator] = useState("equals");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const { projects } = useTaskProjects();
  const { getConditionLabel } = useConditionLabels();

  // Reset form values when dialog opens
  useEffect(() => {
    if (open) {
      setConditionType("due");
      setConditionValue("");
      setConditionOperator("equals");
      setSelectedDate(undefined);
    }
  }, [open]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Convert date to a format our filter system can understand
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + (1 + 7 - today.getDay()) % 7);
      
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      
      // Determine which standard date period to use
      if (date.getTime() === today.getTime()) {
        setConditionValue("today");
      } else if (date.getTime() === tomorrow.getTime()) {
        setConditionValue("tomorrow");
      } else if (date >= thisWeekStart && date <= thisWeekEnd) {
        setConditionValue("this_week");
      } else if (date >= nextWeekStart && date < new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        setConditionValue("next_week");
      } else {
        // For dates that don't fit standard periods, use the date directly
        setConditionValue(format(date, "yyyy-MM-dd"));
      }
    }
  };

  // Handle adding a new condition
  const handleAddCondition = () => {
    if (!conditionValue) {
      console.log("No condition value selected");
      return;
    }

    const newCondition = {
      type: conditionType,
      operator: conditionOperator,
      value: conditionValue,
    };
    
    // Add to existing conditions
    const currentItems = Array.isArray(filterConditions.items) ? filterConditions.items : [];
    const updatedConditions = {
      items: [...currentItems, newCondition],
      logic: filterConditions.logic || "and",
    };
    
    onFilterConditionsChange(updatedConditions);
    
    // Reset form
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    setSelectedDate(undefined);
  };

  // Handle removing a condition
  const handleRemoveCondition = (index: number) => {
    if (!filterConditions.items) return;
    
    const updatedItems = [...filterConditions.items];
    updatedItems.splice(index, 1);
    
    const updatedConditions = {
      ...filterConditions,
      items: updatedItems,
    };
    
    onFilterConditionsChange(updatedConditions);
  };

  // Handle changing condition logic (AND/OR)
  const handleLogicChange = (logic: string) => {
    const updatedConditions = {
      ...filterConditions,
      logic,
    };
    
    onFilterConditionsChange(updatedConditions);
  };

  // Format condition for display
  const getFullConditionLabel = (condition: any) => {
    return getConditionLabel(condition, projects);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <EditFilterHeader />
        
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
            <div className="space-y-4">
              <FilterLogicSelector 
                logic={filterConditions.logic || "and"} 
                onLogicChange={handleLogicChange}
              />
              
              <CurrentConditionsList 
                conditions={filterConditions.items || []}
                getConditionLabel={getFullConditionLabel}
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
          </TabsContent>
        </Tabs>
        
        <EditFilterFooter 
          onCancel={() => onOpenChange(false)}
          onSave={onSave}
          isUpdating={isUpdating}
        />
      </DialogContent>
    </Dialog>
  );
}
