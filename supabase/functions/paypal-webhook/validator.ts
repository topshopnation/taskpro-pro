
import { logger } from "./logger.ts";
import { createResponse } from "./response.ts";

/**
 * Validates the incoming webhook request, parsing the body and checking headers
 */
export async function validateWebhookRequest(req: Request): Promise<{ 
  requestData: any; 
  headersObj: Record<string, string>; 
  isSimulator: boolean;
}> {
  // Print all request headers for debugging
  logger.section("REQUEST HEADERS");
  const headersObj = Object.fromEntries([...req.headers.entries()]);
  logger.info("All request headers:", JSON.stringify(headersObj, null, 2));
  
  // Get the request body as text first to ensure we can see the raw payload
  const bodyText = await req.text();
  logger.section("RAW REQUEST BODY", bodyText);
  
  // Parse the JSON
  let requestData;
  try {
    requestData = JSON.parse(bodyText);
    logger.section("WEBHOOK EVENT DATA", requestData);
  } catch (e) {
    logger.error("Failed to parse webhook payload as JSON:", e);
    throw new Error("Invalid JSON payload");
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
