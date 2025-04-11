
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface FilterDialogFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function FilterDialogFooter({
  onCancel,
  onSubmit,
  isLoading
}: FilterDialogFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSubmit} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Filter"}
      </Button>
    </DialogFooter>
  );
}
