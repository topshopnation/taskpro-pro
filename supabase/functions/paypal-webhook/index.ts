
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { handlePaymentEvent } from "./payment-handler.ts";
import { validateWebhookRequest } from "./validator.ts";
import { createResponse } from "./response.ts";
import { logger } from "./logger.ts";
import { handleError } from "./error-utils.ts";

serve(async (req) => {
  logger.info("==================== WEBHOOK REQUEST RECEIVED ====================");
  logger.info("PayPal webhook received at:", new Date().toISOString());
  logger.info("Request method:", req.method);
  logger.info("Request URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logger.info("Handling OPTIONS request (CORS preflight)");
    return createResponse(null, 200, corsHeaders);
  }

  try {
    // Validate and parse the webhook request
    const { requestData, headersObj, isSimulator } = await validateWebhookRequest(req);
    
    // Process payment events
    if (
      requestData.event_type === "PAYMENT.SALE.COMPLETED" ||
      requestData.event_type === "CHECKOUT.ORDER.APPROVED" ||
      requestData.event_type === "BILLING.SUBSCRIPTION.CREATED" ||
      requestData.event_type === "BILLING.SUBSCRIPTION.RENEWED" ||
      requestData.event_type === "BILLING.SUBSCRIPTION.CANCELLED"
    ) {
      logger.info("Processing payment/subscription event:", requestData.event_type);
      return await handlePaymentEvent(requestData, isSimulator);
    }

    // For other event types, just acknowledge receipt
    logger.info("Received non-payment event type:", requestData.event_type);
    return createResponse({ 
      success: true, 
      message: "Event received", 
      event_type: requestData.event_type 
    }, 200);
  } catch (error) {
    return handleError(error);
  }
});
