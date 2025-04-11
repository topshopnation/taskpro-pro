
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPicker } from "@/components/ui/color-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterDialogsProps {
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  filterName: string;
  filterColor?: string;
  filterConditions?: any;
  isUpdating?: boolean;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onFilterNameChange: (name: string) => void;
  onFilterColorChange?: (color: string) => void;
  onFilterConditionsChange?: (conditions: any) => void;
  onRename: () => void;
  onDelete: () => void;
}

const filterFormSchema = z.object({
  type: z.string(),
  value: z.string(),
  operator: z.string().optional(),
});

export function FilterDialogs({
  isEditDialogOpen,
  isDeleteDialogOpen,
  filterName,
  filterColor = "",
  filterConditions = { items: [], logic: "and" },
  isUpdating = false,
  onEditDialogChange,
  onDeleteDialogChange,
  onFilterNameChange,
  onFilterColorChange,
  onFilterConditionsChange,
  onRename,
  onDelete,
}: FilterDialogsProps) {
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
  
  // Initialize form for condition
  const form = useForm({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      type: "due",
      operator: "equals",
      value: "today",
    },
  });

  // Reset form values when dialog opens
  useEffect(() => {
    if (isEditDialogOpen) {
      setConditionType("due");
      setConditionValue("");
      setConditionOperator("equals");
      form.reset({
        type: "due",
        operator: "equals",
        value: "",
      });
    }
  }, [isEditDialogOpen, form]);

  console.log("Current filter conditions:", filterConditions);

  // Handle adding a new condition
  const handleAddCondition = () => {
    if (!conditionValue && !form.getValues().value) {
      console.log("No condition value selected");
      return;
    }

    const values = form.getValues();
    const newCondition = {
      type: conditionType || values.type,
      operator: conditionOperator || values.operator,
      value: conditionValue || values.value,
    };
    
    console.log("Adding new condition:", newCondition);
    
    // Add to existing conditions
    const currentItems = Array.isArray(filterConditions.items) ? filterConditions.items : [];
    const updatedConditions = {
      items: [...currentItems, newCondition],
      logic: filterConditions.logic || "and",
    };
    
    console.log("Updated conditions:", updatedConditions);
    
    if (onFilterConditionsChange) {
      onFilterConditionsChange(updatedConditions);
    }
    
    // Reset form
    setConditionType("due");
    setConditionValue("");
    setConditionOperator("equals");
    form.reset({
      type: "due",
      operator: "equals",
      value: "",
    });
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
    
    console.log("After removing condition:", updatedConditions);
    
    if (onFilterConditionsChange) {
      onFilterConditionsChange(updatedConditions);
    }
  };

  // Handle changing condition logic (AND/OR)
  const handleLogicChange = (logic: string) => {
    const updatedConditions = {
      ...filterConditions,
      logic,
    };
    
    console.log("Logic changed to:", logic);
    console.log("Updated conditions:", updatedConditions);
    
    if (onFilterConditionsChange) {
      onFilterConditionsChange(updatedConditions);
    }
  };

  // Handle condition type change
  const handleConditionTypeChange = (type: string) => {
    setConditionType(type);
    // Reset value when type changes
    setConditionValue("");
  };

  // Get condition type label
  const getConditionTypeLabel = (type: string) => {
    switch (type) {
      case "due":
        return "Due Date";
      case "priority":
        return "Priority";
      case "project":
        return "Project";
      default:
        return type;
    }
  };

  // Get condition value label
  const getConditionValueLabel = (type: string, value: string) => {
    if (type === "due") {
      if (value === "today") return "Today";
      if (value === "tomorrow") return "Tomorrow";
      if (value === "this_week") return "This Week";
      if (value === "next_week") return "Next Week";
    }
    
    if (type === "priority") {
      return `Priority ${value}`;
    }
    
    return value;
  };

  // Log current state for debugging
  console.log("Dialog state:", {
    filterName,
    filterColor,
    filterConditions,
    conditionType,
    conditionValue,
    conditionOperator
  });

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Filter</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basics">Basic Info</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="filter-name">Filter Name</Label>
                  <Input
                    id="filter-name"
                    value={filterName}
                    onChange={(e) => onFilterNameChange(e.target.value)}
                    placeholder="Enter filter name"
                    autoFocus
                  />
                </div>
                
                {onFilterColorChange && (
                  <div>
                    <Label>Filter Color</Label>
                    <IconPicker 
                      colors={filterColors} 
                      onChange={onFilterColorChange} 
                      selectedColor={filterColor} 
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="conditions" className="space-y-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label>Filter Logic</Label>
                  <RadioGroup 
                    value={filterConditions.logic || "and"} 
                    onValueChange={handleLogicChange}
                    className="flex space-x-4 mt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="and" id="logic-and" />
                      <Label htmlFor="logic-and">Match ALL conditions (AND)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="or" id="logic-or" />
                      <Label htmlFor="logic-or">Match ANY condition (OR)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {filterConditions.items && filterConditions.items.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Current Conditions</Label>
                    <div className="flex flex-wrap gap-2">
                      {filterConditions.items.map((condition: any, index: number) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {getConditionTypeLabel(condition.type)}{' '}
                          {condition.operator === "not_equals" ? "is not" : "is"}{' '}
                          {getConditionValueLabel(condition.type, condition.value)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleRemoveCondition(index)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No conditions added yet</div>
                )}
                
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
                        <Select value={conditionValue} onValueChange={setConditionValue}>
                          <SelectTrigger id="condition-value-select">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="this_week">This Week</SelectItem>
                            <SelectItem value="next_week">Next Week</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : conditionType === "priority" ? (
                        <Select value={conditionValue} onValueChange={setConditionValue}>
                          <SelectTrigger id="condition-value-select">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Priority 1</SelectItem>
                            <SelectItem value="2">Priority 2</SelectItem>
                            <SelectItem value="3">Priority 3</SelectItem>
                            <SelectItem value="4">Priority 4</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : conditionType === "project" ? (
                        <Select value={conditionValue} onValueChange={setConditionValue}>
                          <SelectTrigger id="condition-value-select">
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inbox">Inbox</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="condition-value-input"
                          value={conditionValue}
                          onChange={(e) => setConditionValue(e.target.value)}
                          placeholder="Enter value"
                        />
                      )}
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={handleAddCondition}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Condition
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onEditDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={onRename} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this filter. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isUpdating}>
              {isUpdating ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
