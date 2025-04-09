
// This file augments the global types for TypeScript to recognize the Supabase Database type
import { Database } from '@/integrations/supabase/types';

declare global {
  // This extends the Window interface to include types for our Database
  interface Window {
    supabaseDatabase: Database;
  }
}

// For convenience, define filter type here that includes favorite field
export interface Filter {
  id: string;
  name: string;
  conditions: any;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  favorite?: boolean;
  color?: string;
}

export {};
