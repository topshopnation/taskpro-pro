
import { logger } from "./logger.ts";
import { ValidationError } from "./error-utils.ts";

/**
 * Validates the incoming webhook request, parsing the body and checking headers
 */
export async function validateWebhookRequest(req: Request): Promise<{ 
  requestData: any; 
  headersObj: Record<string, string>; 
  isSimulator: boolean;
}> {
  // Validate HTTP method
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    throw new ValidationError(`Invalid HTTP method: ${req.method}. Expected POST.`);
  }
  
  // Print all request headers for debugging
  logger.section("REQUEST HEADERS");
  const headersObj = Object.fromEntries([...req.headers.entries()]);
  logger.info("All request headers:", JSON.stringify(headersObj, null, 2));
  
  // Get the request body as text first to ensure we can see the raw payload
  let bodyText: string;
  try {
    bodyText = await req.text();
    if (!bodyText || bodyText.trim() === "") {
      throw new ValidationError("Empty request body");
    }
    logger.section("RAW REQUEST BODY", bodyText);
  } catch (e) {
    logger.error("Failed to read request body:", e);
    throw new ValidationError("Failed to read request body");
  }
  
  // Parse the JSON
  let requestData;
  try {
    requestData = JSON.parse(bodyText);
    logger.section("WEBHOOK EVENT DATA", requestData);
    
    // Validate basic webhook structure
    if (!requestData.event_type) {
      throw new ValidationError("Missing event_type in webhook payload");
    }
    
    if (!requestData.resource) {
      throw new ValidationError("Missing resource data in webhook payload");
    }
  } catch (e) {
    logger.error("Failed to parse webhook payload as JSON:", e);
    throw new ValidationError("Invalid JSON payload");
  }

  // Get PayPal headers for verification
  const paypalTransmissionId = req.headers.get("paypal-transmission-id");
  const paypalTimestamp = req.headers.get("paypal-transmission-time");
  const paypalSignature = req.headers.get("paypal-transmission-sig");
  const paypalCertUrl = req.headers.get("paypal-cert-url");
  const paypalWebhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  
  logger.section("PAYPAL HEADERS", {
    paypalTransmissionId,
    paypalTimestamp,
    paypalSignature,
    paypalCertUrl,
    paypalWebhookId,
  });

  // Determine if this is a test/simulator request
  // Look at various indicators to determine if this is a test event
  const isSimulator = !paypalTransmissionId || 
                     paypalTransmissionId?.includes("simulator") || 
                     requestData?.id?.includes("WH-TEST") || 
                     requestData?.test === true || 
                     requestData?.id?.includes("WH-") && !requestData?.custom_id;
                     
  logger.info("Is simulator request:", isSimulator);
  
  return { requestData, headersObj, isSimulator };
}
