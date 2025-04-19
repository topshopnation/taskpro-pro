
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2 } from "lucide-react";

interface FeaturesListProps {
  features: string[];
  onRemoveFeature: (index: number) => void;
}

export function FeaturesList({ features, onRemoveFeature }: FeaturesListProps) {
  return (
    <div className="mt-2 space-y-2">
      {features?.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="flex-1 text-sm">{feature}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFeature(index)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ))}
      
      {(features?.length || 0) === 0 && (
        <div className="text-sm text-muted-foreground italic py-2">
          No features added yet
        </div>
      )}
    </div>
  );
}
