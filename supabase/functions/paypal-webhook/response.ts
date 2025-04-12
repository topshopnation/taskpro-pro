
import { corsHeaders } from "./cors.ts";
import { logger } from "./logger.ts";

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
  
  try {
    // For 2xx responses, add a timestamp
    if (status >= 200 && status < 300 && data !== null) {
      data = {
        ...data,
        timestamp: new Date().toISOString()
      };
    }
    
    const body = data !== null ? JSON.stringify(data) : null;
    
    // Log the response we're about to send
    logger.info(`Sending response with status ${status}:`, body ? JSON.parse(body) : "empty body");
    
    return new Response(body, { status, headers });
  } catch (error) {
    // If there's an error during response creation, send a fallback response
    logger.error("Error creating response:", error);
    
    const fallbackBody = JSON.stringify({
      error: "Failed to create response",
      timestamp: new Date().toISOString()
    });
    
    return new Response(fallbackBody, { status: 500, headers });
  }
}
