
import { useState } from "react";
import { Plus, CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTaskProjects } from "@/components/tasks/useTaskProjects";
import { PriorityConditionValue } from "../create-filter/PriorityConditionValue";

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
  // Fetch projects for project selection
  const { projects } = useTaskProjects();

  const handleConditionTypeChange = (type: string) => {
    setConditionType(type);
    // Reset value when type changes
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
            <div className="flex flex-col gap-2">
              <Select value={conditionValue} onValueChange={setConditionValue}>
                <SelectTrigger id="condition-value-select">
                  <SelectValue placeholder="Select value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="next_week">Next Week</SelectItem>
                  <SelectItem value="custom">Custom Date</SelectItem>
                </SelectContent>
              </Select>
              
              {conditionValue === "custom" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
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
          Add Condition
        </Button>
      </div>
    </div>
  );
}
