
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TaskFormNotesProps {
  notes: string;
  onChange: (notes: string) => void;
}

export function TaskFormNotes({ notes, onChange }: TaskFormNotesProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="notes">Notes (optional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add additional details"
        className="resize-none"
        rows={3}
      />
    </div>
  );
}
