
import { useState, useEffect } from "react"
import { format } from "date-fns"

export function useDueDateState(dueDate?: Date) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [timeInput, setTimeInput] = useState<string>("")
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    if (dueDate) {
      if (dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0) {
        setTimeInput(format(dueDate, "HH:mm"))
      } else {
        setTimeInput("")
      }
    } else {
      setTimeInput("")
    }
  }, [dueDate])
  
  return {
    currentMonth,
    setCurrentMonth,
    timeInput,
    setTimeInput,
    open,
    setOpen
  }
}
