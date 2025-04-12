
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { logger } from "./logger.ts";

const supabaseUrl = "https://rfjydtygaymoovkkmyuj.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

/**
 * Creates and returns a Supabase client instance
 */
export function getSupabaseClient() {
  if (!supabaseServiceKey) {
    logger.error("SUPABASE_SERVICE_ROLE_KEY is not set. Cannot connect to Supabase.");
    throw new Error("Server configuration error");
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  logger.info("Supabase client created successfully");
  
  return supabase;
}
