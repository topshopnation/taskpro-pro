
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { getQuickDateOptions } from "@/utils/dateUtils";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };
  
  // Handle quick date selection - also sets condition value to appropriate predefined option
  const handleQuickDateSelect = (date: Date | undefined) => {
    if (!date) {
      handleDateSelect(undefined);
      setConditionValue("");
      setOpen(false);
      return;
    }
    
    handleDateSelect(date);
    
    // Set the appropriate condition value based on the quick option selected
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextMonday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    
    // Check which quick date was selected
    if (date.getTime() === today.getTime()) {
      setConditionValue("today");
    } else if (date.getTime() === tomorrow.getTime()) {
      setConditionValue("tomorrow");
    } else if (date.getTime() === nextMonday.getTime()) {
      setConditionValue("next_week");
    } else {
      // For other dates, use the formatted date
      setConditionValue(formatDateToValue(date));
    }
    
    setOpen(false);
  };

  // Get quick date options for consistency
  const quickOptions = getQuickDateOptions();

  const handleSelectChange = (value: string) => {
    setConditionValue(value);
    
    // If a predefined option is selected, update the selected date accordingly
    switch (value) {
      case "today": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        handleDateSelect(today);
        break;
      }
      case "tomorrow": {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        handleDateSelect(tomorrow);
        break;
      }
      case "this_week": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        handleDateSelect(today);
        break;
      }
      case "next_week": {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + daysUntilNextMonday);
        nextMonday.setHours(0, 0, 0, 0);
        handleDateSelect(nextMonday);
        break;
      }
      default:
        // Don't change the date for custom option
        break;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Select value={conditionValue} onValueChange={handleSelectChange}>
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
        <Popover open={open} onOpenChange={setOpen}>
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
            className="w-auto p-0 z-50" 
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
