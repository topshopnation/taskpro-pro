
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { getQuickDateOptions } from "@/utils/dateUtils";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showQuickOptions?: boolean;
  onQuickOptionSelect?: (date: Date | undefined) => void;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showQuickOptions = false,
  onQuickOptionSelect,
  ...props
}: CalendarProps) {
  const quickOptions = getQuickDateOptions();
  const currentDate = new Date();
  const currentMonth = `${format(props.month || currentDate, "MMM yyyy")}`;

  const handleQuickOptionClick = (date: Date | undefined, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Stop event propagation
    
    if (onQuickOptionSelect) {
      onQuickOptionSelect(date);
    }
  };

  // Helper function to compare dates safely (day comparison only, ignores time)
  const areDatesEqual = (date1: Date | undefined, date2: Date | undefined): boolean => {
    if (!date1 || !date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Helper function to check if a date is in the selected array
  const isDateSelected = (date: Date | undefined): boolean => {
    if (!date || !props.selected) return false;
    
    if (props.selected instanceof Date) {
      return areDatesEqual(date, props.selected);
    }
    
    if (Array.isArray(props.selected)) {
      return props.selected.some(selectedDate => areDatesEqual(date, selectedDate));
    }
    
    return false;
  };

  return (
    <div className="flex flex-col space-y-1">
      {showQuickOptions && (
        <div className="flex flex-col divide-y border rounded-md mb-1 bg-background max-h-52 overflow-y-auto z-50">
          {quickOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => handleQuickOptionClick(option.date, e)}
              className={cn(
                "flex items-center justify-between p-1.5 text-sm hover:bg-muted transition-colors pointer-events-auto",
                option.date && isDateSelected(option.date) && "bg-primary/10"
              )}
              type="button"
            >
              <div className="flex items-center space-x-2">
                {option.value === "today" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md border text-xs">
                    {option.date ? format(option.date, "d") : ""}
                  </span>
                )}
                {option.value === "tomorrow" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md text-xs text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2"/>
                      <path d="M12 20v2"/>
                      <path d="M5 5l1.5 1.5"/>
                      <path d="M17.5 17.5L19 19"/>
                      <path d="M2 12h2"/>
                      <path d="M20 12h2"/>
                      <path d="M5 19l1.5-1.5"/>
                      <path d="M17.5 6.5L19 5"/>
                    </svg>
                  </span>
                )}
                {option.value === "next-week" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md text-xs text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                  </span>
                )}
                {option.value === "weekend" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md text-xs text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/>
                      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/>
                      <path d="M12 4v6"/>
                      <path d="M2 18h20"/>
                    </svg>
                  </span>
                )}
                {option.value === "no-date" && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-md text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                )}
                <span className="font-medium text-xs">{option.label}</span>
              </div>
              <span className="text-muted-foreground text-xs">{option.day}</span>
            </button>
          ))}
        </div>
      )}
      
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-2 pointer-events-auto", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-3 sm:space-x-3 sm:space-y-0",
          month: "space-y-3",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-xs font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem]",
          row: "flex w-full mt-1",
          cell: "h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-7 w-7 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-3 w-3" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-3 w-3" />,
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
