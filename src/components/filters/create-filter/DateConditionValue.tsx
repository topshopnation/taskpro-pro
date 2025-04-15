
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { getQuickDateOptions } from "@/utils/dateUtils";

interface DateConditionValueProps {
  conditionValue: string;
  setConditionValue: (value: string) => void;
  selectedDate: Date | undefined;
  handleDateSelect: (date: Date | undefined) => void;
}

export function DateConditionValue({
  conditionValue,
  setConditionValue,
  selectedDate,
  handleDateSelect
}: DateConditionValueProps) {
  // Function to format date to required string format
  const formatDateToValue = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  // Handle date selection and update condition value
  const handleCalendarSelect = (date: Date | undefined) => {
    handleDateSelect(date);
    if (date) {
      setConditionValue(formatDateToValue(date));
    } else {
      setConditionValue("");
    }
  };
  
  // Handle quick date selection
  const handleQuickDateSelect = (date: Date | undefined) => {
    handleCalendarSelect(date);
  };

  // Get quick date options for consistency
  const quickOptions = getQuickDateOptions();

  return (
    <div className="flex flex-col gap-2">
      <Select value={conditionValue} onValueChange={setConditionValue}>
        <SelectTrigger id="condition-value-select">
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="tomorrow">Tomorrow</SelectItem>
          <SelectItem value="this_week">This Week</SelectItem>
          <SelectItem value="next_week">Next Week</SelectItem>
          <SelectItem value="custom">Custom Date</SelectItem>
        </SelectContent>
      </Select>
      
      {conditionValue === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
            avoidCollisions={true}
            side="right"
            sideOffset={5}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              initialFocus
              showQuickOptions={true}
              onQuickOptionSelect={handleQuickDateSelect}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
