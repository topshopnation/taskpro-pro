
import { format, isToday as isDayToday, isTomorrow as isDayTomorrow, nextSaturday, nextMonday, isSameDay, addDays, startOfWeek, endOfWeek } from "date-fns";

// Get today's date with time set to midnight
export const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Get tomorrow's date
export const getTomorrow = () => {
  const tomorrow = new Date(getToday());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

// Get the date of the next Saturday
export const getNextSaturday = () => {
  return nextSaturday(getToday());
};

// Get the date of the next weekend (Saturday)
export const getNextWeekend = () => {
  const today = getToday();
  const daysUntilSaturday = ((6 - today.getDay()) % 7);
  return addDays(today, daysUntilSaturday);
};

// Get the date of the next Monday
export const getNextMonday = () => {
  return nextMonday(getToday());
};

// Check if a date is today
export const isToday = (date: Date) => {
  return isDayToday(date);
};

// Check if a date is tomorrow
export const isTomorrow = (date: Date) => {
  return isDayTomorrow(date);
};

// Check if a date is the next Saturday (this weekend)
export const isThisWeekend = (date: Date) => {
  const nextSat = getNextSaturday();
  return isSameDay(date, nextSat);
};

// Check if a date is the next Monday (next week)
export const isNextWeek = (date: Date) => {
  const nextMon = getNextMonday();
  return isSameDay(date, nextMon);
};

// Format a date in a human-readable way
export const formatDateFriendly = (date: Date | undefined): string => {
  if (!date) return 'No date';
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isThisWeekend(date)) return 'This Weekend';
  if (isNextWeek(date)) return 'Next Week';
  
  return format(date, 'MMM d, yyyy');
};

// Format a date with day of week
export const formatDateWithDay = (date: Date | undefined): string => {
  if (!date) return 'No date';
  return format(date, 'EEE, MMM d');
};

// Get a friendly representation of a date with its day of week
export const getDateLabelWithDay = (date: Date | undefined): { label: string; day: string } => {
  if (!date) return { label: 'No date', day: '' };
  
  if (isToday(date)) return { label: 'Today', day: format(date, 'EEE') };
  if (isTomorrow(date)) return { label: 'Tomorrow', day: format(date, 'EEE') };
  if (isThisWeekend(date)) return { label: 'This Weekend', day: format(date, 'EEE MMM d') };
  if (isNextWeek(date)) return { label: 'Next Week', day: format(date, 'EEE MMM d') };
  
  return { label: format(date, 'MMM d'), day: format(date, 'EEE') };
};

// Get formatted date options for quick selection
export const getQuickDateOptions = () => {
  const today = getToday();
  const tomorrow = getTomorrow();
  const nextWeekend = getNextWeekend();
  const nextWeek = getNextMonday();

  return [
    {
      label: "Today",
      day: format(today, "EEE"),
      date: today,
      value: "today"
    },
    {
      label: "Tomorrow",
      day: format(tomorrow, "EEE"),
      date: tomorrow,
      value: "tomorrow"
    },
    {
      label: "Next week",
      day: `${format(nextWeek, "EEE MMM d")}`,
      date: nextWeek,
      value: "next-week"
    },
    {
      label: "Next weekend",
      day: `${format(nextWeekend, "EEE MMM d")}`,
      date: nextWeekend,
      value: "weekend"
    },
    {
      label: "No Date",
      day: "",
      date: undefined,
      value: "no-date"
    }
  ];
};
