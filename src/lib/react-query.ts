
import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: true
    },
  },
});

// Helper function to determine if a date is today
export const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper function to determine if a date is tomorrow
export const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
};

// Helper function to check if a date is the next Saturday
export const isNextSaturday = (date: Date) => {
  const today = new Date();
  const nextSat = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const daysUntilNextSat = (6 - dayOfWeek) % 7;
  nextSat.setDate(today.getDate() + daysUntilNextSat);
  
  return date.getDate() === nextSat.getDate() &&
    date.getMonth() === nextSat.getMonth() &&
    date.getFullYear() === nextSat.getFullYear();
};

// Helper function to check if a date is the next Monday
export const isNextMonday = (date: Date) => {
  const today = new Date();
  const nextMon = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sunday, ..., 6 = Saturday
  const daysUntilNextMon = (8 - dayOfWeek) % 7;
  nextMon.setDate(today.getDate() + daysUntilNextMon);
  
  return date.getDate() === nextMon.getDate() &&
    date.getMonth() === nextMon.getMonth() &&
    date.getFullYear() === nextMon.getFullYear();
};

// Function to format a date in friendly terms
export const formatDateFriendly = (date: Date | undefined) => {
  if (!date) return '';
  
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isNextSaturday(date)) return 'This Weekend';
  if (isNextMonday(date)) return 'Next Week';
  
  return null; // Return null if it's none of the special dates
};
