
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Condition {
  id: string
  type: string
  value: string
  operator?: string
}

interface CreateFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFilterDialog({ open, onOpenChange }: CreateFilterDialogProps) {
  const [name, setName] = useState("")
  const [conditions, setConditions] = useState<Condition[]>([])
  const [logic, setLogic] = useState("and")
  
  // For new condition form
  const [conditionType, setConditionType] = useState("due")
  const [conditionValue, setConditionValue] = useState("")
  const [conditionOperator, setConditionOperator] = useState("equals")

  const addCondition = () => {
    if (!conditionValue) {
      toast.error("Condition value is required")
      return
    }

    const newCondition: Condition = {
      id: Date.now().toString(),
      type: conditionType,
      value: conditionValue,
      operator: conditionOperator
    }

    setConditions([...conditions, newCondition])
    
    // Reset form
    setConditionType("due")
    setConditionValue("")
    setConditionOperator("equals")
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(condition => condition.id !== id))
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Filter name is required")
      return
    }

    if (conditions.length === 0) {
      toast.error("At least one condition is required")
      return
    }

    // TODO: Add filter to Supabase database
    console.log({
      name,
      conditions,
      logic
    })

    toast.success("Filter created successfully")
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setName("")
    setConditions([])
    setLogic("and")
    setConditionType("due")
    setConditionValue("")
    setConditionOperator("equals")
  }

  // Helper to render condition type label
  const getConditionLabel = (condition: Condition) => {
    const typeLabels: Record<string, string> = {
      due: "Due Date",
      priority: "Priority",
      project: "Project"
    }
    
    const operatorLabels: Record<string, string> = {
      equals: "is",
      not_equals: "is not"
    }

    const valueLabels: Record<string, Record<string, string>> = {
      due: {
        today: "Today",
        tomorrow: "Tomorrow",
        this_week: "This Week",
        next_week: "Next Week"
      },
      priority: {
        "1": "Priority 1",
        "2": "Priority 2",
        "3": "Priority 3",
        "4": "Priority 4"
      }
    }

    const typeLabel = typeLabels[condition.type] || condition.type
    const operatorLabel = condition.operator ? operatorLabels[condition.operator] || condition.operator : ""
    
    // Handle special value labels
    let valueLabel = condition.value
    if (condition.type in valueLabels && condition.value in valueLabels[condition.type]) {
      valueLabel = valueLabels[condition.type][condition.value]
    }

    return `${typeLabel} ${operatorLabel} ${valueLabel}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Filter</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="filter-name">Filter Name</Label>
            <Input
              id="filter-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter filter name"
              autoFocus
            />
          </div>
          
          {/* Current conditions */}
          {conditions.length > 0 && (
            <div className="space-y-2">
              <Label>Current Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.map((condition) => (
                  <Badge 
                    key={condition.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {getConditionLabel(condition)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeCondition(condition.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Add condition form */}
          <div className="space-y-3 rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="condition-type">Condition Type</Label>
                <Select value={conditionType} onValueChange={setConditionType}>
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
                <Select value={conditionOperator} onValueChange={setConditionOperator}>
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
              onClick={addCondition}
              className="w-full mt-2"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>

          {/* Logic selector */}
          {conditions.length > 1 && (
            <div className="grid gap-2">
              <Label>Condition Logic</Label>
              <RadioGroup 
                value={logic} 
                onValueChange={setLogic}
                className="flex space-x-4"
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
