
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TaskFormTitleProps {
  title: string;
  onChange: (title: string) => void;
}

export function TaskFormTitle({ title, onChange }: TaskFormTitleProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
      />
    </div>
  );
}
