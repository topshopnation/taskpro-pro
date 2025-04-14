
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";
import { PriorityConditionValue } from "../create-filter/PriorityConditionValue";
import { DateConditionValue } from "../create-filter/DateConditionValue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveConditionButton } from "../create-filter/components/SaveConditionButton";
import { ConditionSelectors } from "../create-filter/components/ConditionSelectors";

interface AddConditionFormProps {
  conditionType: string;
  setConditionType: (type: string) => void;
  conditionOperator: string;
  setConditionOperator: (operator: string) => void;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
  addCondition: () => void;
}

export function AddConditionForm({
  conditionType,
  setConditionType,
  conditionOperator,
  setConditionOperator,
  conditionValue,
  setConditionValue,
  selectedDate,
  handleDateSelect,
  addCondition
}: AddConditionFormProps) {
  const { projects } = useTaskProjects();

  const handleConditionTypeChange = (type: string) => {
    setConditionType(type);
    setConditionValue("");
  };

  return (
    <div className="border-t pt-4">
      <Label>Add New Condition</Label>
      <div className="grid gap-4 py-2">
        <ConditionSelectors
          conditionType={conditionType}
          onConditionTypeChange={handleConditionTypeChange}
          conditionOperator={conditionOperator}
          setConditionOperator={setConditionOperator}
        />
        
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
            <Select value={conditionValue} onValueChange={setConditionValue}>
              <SelectTrigger id="condition-value-select">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        
        <SaveConditionButton 
          onClick={addCondition}
        />
      </div>
    </div>
  );
}
