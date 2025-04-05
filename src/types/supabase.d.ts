
// This file augments the global types for TypeScript to recognize the Supabase Database type
import { Database } from '@/integrations/supabase/types';

declare global {
  // This extends the Window interface to include types for our Database
  interface Window {
    supabaseDatabase: Database;
  }
}

export {};
