
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface EditFilterFooterProps {
  onCancel: () => void;
  onSave: () => void;
  isUpdating: boolean;
}

export function EditFilterFooter({
  onCancel,
  onSave,
  isUpdating
}: EditFilterFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Save Changes"}
      </Button>
    </DialogFooter>
  );
}
