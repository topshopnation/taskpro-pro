
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FilterNameInputProps {
  name: string;
  setName: (name: string) => void;
  isNameError: boolean;
  validateFilterName: (name: string) => boolean;
}

export function FilterNameInput({ 
  name, 
  setName, 
  isNameError, 
  validateFilterName 
}: FilterNameInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="filter-name">Filter Name</Label>
      <Input
        id="filter-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (isNameError) validateFilterName(e.target.value);
        }}
        placeholder="Enter filter name"
        autoFocus
        className={isNameError ? "border-destructive" : ""}
      />
      {isNameError && (
        <p className="text-sm text-destructive">
          Please enter a unique filter name
        </p>
      )}
    </div>
  );
}
