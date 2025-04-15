
import { format } from "date-fns"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useMediaQuery } from "@/hooks/use-mobile"
import { TimeInput } from "./due-date/TimeInput"
import { DueDateButton } from "./due-date/DueDateButton"
import { useDueDateState } from "./due-date/useDueDateState"

interface TaskItemDueDateProps {
  dueDate?: Date
  onDateChange: (date: Date | undefined) => void
  isUpdating: boolean
}

export function TaskItemDueDate({ dueDate, onDateChange, isUpdating }: TaskItemDueDateProps) {
  const isOverdue = dueDate && new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0))
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { currentMonth, setCurrentMonth, timeInput, setTimeInput, open, setOpen } = useDueDateState(dueDate)

  // Add time to a date
  const addTimeToDate = (date: Date, timeStr: string) => {
    if (!timeStr) return date
    const [hours, minutes] = timeStr.split(':').map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours || 0)
    newDate.setMinutes(minutes || 0)
    return newDate
  }

  // Handle setting a date without time
  const handleDateSelection = (date: Date | undefined) => {
    if (!date) {
      onDateChange(undefined)
      return
    }
    
    if (timeInput) {
      const dateWithTime = addTimeToDate(date, timeInput)
      onDateChange(dateWithTime)
    } else {
      const dateWithoutTime = new Date(date)
      dateWithoutTime.setHours(0, 0, 0, 0)
      onDateChange(dateWithoutTime)
    }
    
    setOpen(false)
  }

  // Handle quick date selection
  const handleQuickDateSelection = (date: Date | undefined) => {
    if (!date) {
      onDateChange(undefined)
      setOpen(false)
      return
    }
    
    const dateWithoutTime = new Date(date)
    dateWithoutTime.setHours(0, 0, 0, 0)
    onDateChange(dateWithoutTime)
    setOpen(false)
  }

  // Handle time input change
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeInput = e.target.value
    setTimeInput(newTimeInput)
    
    if (dueDate && newTimeInput) {
      const dateWithTime = addTimeToDate(dueDate, newTimeInput)
      onDateChange(dateWithTime)
    } else if (dueDate && !newTimeInput) {
      const dateWithoutTime = new Date(dueDate)
      dateWithoutTime.setHours(0, 0, 0, 0)
      onDateChange(dateWithoutTime)
    }
  }

  // Clear time
  const handleClearTime = () => {
    setTimeInput("")
    if (dueDate) {
      const dateWithoutTime = new Date(dueDate)
      dateWithoutTime.setHours(0, 0, 0, 0)
      onDateChange(dateWithoutTime)
    }
  }

  const shouldShowTime = dueDate && 
    (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0)
  const timeString = shouldShowTime ? format(dueDate, "HH:mm") : ""
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DueDateButton 
        dueDate={dueDate}
        isOverdue={Boolean(isOverdue)}
        isUpdating={isUpdating}
        timeString={timeString}
      />
      
      <PopoverContent 
        align="end" 
        className="w-auto p-2 z-50" 
        side={isMobile ? "bottom" : "right"}
        alignOffset={isMobile ? -40 : 0}
        sideOffset={5}
        avoidCollisions={true}
      >
        <div className="flex flex-col space-y-2">
          <TimeInput
            timeInput={timeInput}
            onTimeChange={handleTimeInputChange}
            onClearTime={handleClearTime}
          />
          
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={handleDateSelection}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            showQuickOptions={true}
            onQuickOptionSelect={handleQuickDateSelection}
            className="rounded-md border shadow-sm bg-background pointer-events-auto"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
