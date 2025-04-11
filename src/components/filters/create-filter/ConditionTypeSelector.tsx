
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConditionTypeSelectorProps {
  conditionType: string;
  onConditionTypeChange: (value: string) => void;
}

export function ConditionTypeSelector({
  conditionType,
  onConditionTypeChange
}: ConditionTypeSelectorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="condition-type">Condition Type</Label>
      <Select value={conditionType} onValueChange={onConditionTypeChange}>
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
  );
}
