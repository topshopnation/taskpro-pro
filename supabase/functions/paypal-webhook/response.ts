
import { corsHeaders } from "./cors.ts";

/**
 * Creates a standardized Response object with CORS headers
 */
export function createResponse(
  data: any, 
  status: number = 200, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers = { 
    ...corsHeaders, 
    "Content-Type": "application/json",
    ...additionalHeaders 
  };
  
  const body = data !== null ? JSON.stringify(data) : null;
  
  return new Response(body, { status, headers });
}
