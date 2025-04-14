import { useState } from "react";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";
import { PriorityConditionValue } from "../create-filter/PriorityConditionValue";
import { DateConditionValue } from "../create-filter/DateConditionValue";

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
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="condition-type">Condition Type</Label>
            <Select
              value={conditionType}
              onValueChange={handleConditionTypeChange}
            >
              <SelectTrigger id="condition-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="condition-operator">Operator</Label>
            <Select
              value={conditionOperator}
              onValueChange={setConditionOperator}
            >
              <SelectTrigger id="condition-operator">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">is</SelectItem>
                <SelectItem value="not_equals">is not</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
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
                {projects && projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
        
        <Button 
          type="button" 
          onClick={addCondition}
          className="w-full mt-2"
          variant="outline"
          disabled={!conditionValue}
        >
          <Plus className="mr-2 h-4 w-4" />
          Save Condition
        </Button>
      </div>
    </div>
  );
}
