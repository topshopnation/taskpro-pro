
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SaveConditionButtonProps {
  onClick: () => void;
}

export function SaveConditionButton({ onClick }: SaveConditionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="w-full mt-2"
      variant="outline"
    >
      <Plus className="mr-2 h-4 w-4" />
      Save Condition
    </Button>
  );
}
