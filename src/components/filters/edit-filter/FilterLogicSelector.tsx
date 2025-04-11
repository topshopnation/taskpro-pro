
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FilterLogicSelectorProps {
  logic: string;
  onLogicChange: (logic: string) => void;
}

export function FilterLogicSelector({ logic, onLogicChange }: FilterLogicSelectorProps) {
  return (
    <div>
      <Label>Filter Logic</Label>
      <RadioGroup 
        value={logic} 
        onValueChange={onLogicChange}
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
  );
}
