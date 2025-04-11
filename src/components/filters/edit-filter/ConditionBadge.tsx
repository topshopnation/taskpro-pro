
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConditionBadgeProps {
  label: string;
  onRemove: () => void;
}

export function ConditionBadge({ label, onRemove }: ConditionBadgeProps) {
  return (
    <Badge 
      variant="secondary"
      className="flex items-center gap-1 px-2 py-1"
    >
      {label}
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 ml-1"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove</span>
      </Button>
    </Badge>
  );
}
