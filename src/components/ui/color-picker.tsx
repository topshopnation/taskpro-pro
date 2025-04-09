
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  colors: string[];
  onChange: (color: string) => void;
  selectedColor?: string;
}

export function IconPicker({ colors, onChange, selectedColor }: IconPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          type="button"
        >
          {selectedColor === color && (
            <Check className="h-4 w-4 text-white" />
          )}
        </button>
      ))}
    </div>
  );
}
