
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconPicker } from "@/components/ui/color-picker";

interface EditFilterBasicsTabProps {
  filterName: string;
  onFilterNameChange: (name: string) => void;
  filterColor: string;
  onFilterColorChange: (color: string) => void;
  filterColors: string[];
}

export function EditFilterBasicsTab({
  filterName,
  onFilterNameChange,
  filterColor,
  onFilterColorChange,
  filterColors
}: EditFilterBasicsTabProps) {
  return (
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
  );
}
