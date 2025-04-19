
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FeatureInputProps {
  newFeature: string;
  onFeatureChange: (feature: string) => void;
  onAddFeature: () => void;
}

export function FeatureInput({ newFeature, onFeatureChange, onAddFeature }: FeatureInputProps) {
  return (
    <div className="flex gap-2">
      <Input 
        value={newFeature} 
        onChange={(e) => onFeatureChange(e.target.value)}
        placeholder="Add a feature"
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddFeature();
          }
        }}
      />
      <Button type="button" onClick={onAddFeature}>Add</Button>
    </div>
  );
}
