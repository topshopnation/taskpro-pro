
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function FilterFormHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Create New Filter</DialogTitle>
      <DialogDescription>
        Create a filter to easily find tasks that match specific criteria.
      </DialogDescription>
    </DialogHeader>
  );
}
