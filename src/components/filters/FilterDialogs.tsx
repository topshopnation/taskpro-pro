
import { useState } from "react";
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
  
  // Initialize form for condition
  const form = useForm({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      type: "due",
      operator: "equals",
      value: "today",
    },
  });

  // Handle adding a new condition
  const handleAddCondition = () => {
    const values = form.getValues();
    const newCondition = {
      type: values.type,
      operator: values.operator,
      value: values.value,
    };
    
    // Add to existing conditions
    const updatedConditions = {
      items: [...(Array.isArray(filterConditions.items) ? filterConditions.items : []), newCondition],
      logic: filterConditions.logic || "and",
    };
    
    if (onFilterConditionsChange) {
      onFilterConditionsChange(updatedConditions);
    }
    
    // Reset form
    form.reset({
      type: "due",
      operator: "equals",
      value: "today",
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
    
    if (onFilterConditionsChange) {
      onFilterConditionsChange(updatedConditions);
    }
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
      if (value === "this_week") return "This Week";
      if (value === "future") return "In the Future";
    }
    
    if (type === "priority") {
      return `Priority ${value}`;
    }
    
    return value;
  };

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
                  <FormLabel>Filter Name</FormLabel>
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
                    <FormLabel>Filter Color</FormLabel>
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
                  <FormLabel>Filter Logic</FormLabel>
                  <div className="flex space-x-2 mt-1">
                    <Button
                      variant={filterConditions.logic === "and" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLogicChange("and")}
                    >
                      Match ALL conditions (AND)
                    </Button>
                    <Button
                      variant={filterConditions.logic === "or" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLogicChange("or")}
                    >
                      Match ANY condition (OR)
                    </Button>
                  </div>
                </div>
                
                {filterConditions.items && filterConditions.items.length > 0 ? (
                  <div className="space-y-2">
                    <FormLabel>Current Conditions</FormLabel>
                    <div className="space-y-2 border rounded-md p-3">
                      {filterConditions.items.map((condition: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{getConditionTypeLabel(condition.type)}</span>
                            <span className="text-muted-foreground mx-1">{condition.operator || "equals"}</span>
                            <span>{getConditionValueLabel(condition.type, condition.value)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCondition(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No conditions added yet</div>
                )}
                
                <div className="border-t pt-4">
                  <FormLabel>Add New Condition</FormLabel>
                  <Form {...form}>
                    <div className="grid gap-4 py-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="due">Due Date</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition Value</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {form.watch("type") === "due" && (
                                  <>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                  </>
                                )}
                                
                                {form.watch("type") === "priority" && (
                                  <>
                                    <SelectItem value="1">Priority 1</SelectItem>
                                    <SelectItem value="2">Priority 2</SelectItem>
                                    <SelectItem value="3">Priority 3</SelectItem>
                                    <SelectItem value="4">Priority 4</SelectItem>
                                  </>
                                )}
                                
                                {form.watch("type") === "project" && (
                                  <SelectItem value="inbox">Inbox</SelectItem>
                                  // Ideally would list all user projects here
                                )}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <Button type="button" onClick={handleAddCondition}>
                        Add Condition
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onEditDialogChange(false)}>
              Cancel
            </Button>
            <Button onClick={onRename}>{isUpdating ? "Updating..." : "Save"}</Button>
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
