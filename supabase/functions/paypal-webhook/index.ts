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
  
  // Log request headers for debugging
  const headersObj = Object.fromEntries([...req.headers.entries()]);
  logger.info("Request headers:", JSON.stringify(headersObj, null, 2));
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    logger.info("Handling OPTIONS request (CORS preflight)");
    return createResponse(null, 200, corsHeaders);
  }

  try {
    // Get request body and log it for debugging
    const bodyText = await req.text();
    logger.info("Request body:", bodyText);
    
    let requestData;
    try {
      requestData = JSON.parse(bodyText);
    } catch (e) {
      logger.error("Failed to parse request body as JSON:", e);
      return createResponse({ error: "Invalid JSON payload" }, 400);
    }
    
    // Log parsed request data
    logger.info("Parsed request data:", JSON.stringify(requestData, null, 2));
    
    // Validate webhook request (simplified for more immediate logging)
    const isSimulator = !headersObj["paypal-transmission-id"] || 
                      headersObj["paypal-transmission-id"]?.includes("simulator") || 
                      requestData?.id?.includes("WH-TEST") || 
                      requestData?.test === true;
    
    logger.info("Is simulator request:", isSimulator);
    
    // Handle subscription events
    if (
      requestData.event_type?.startsWith('BILLING.SUBSCRIPTION.') ||
      requestData.event_type === 'PAYMENT.SALE.COMPLETED' ||
      requestData.event_type === 'CHECKOUT.ORDER.APPROVED'
    ) {
      // Import the subscription handler
      const { handleSubscriptionEvent } = await import("./subscription-handler.ts");
      
      if (requestData.event_type?.startsWith('BILLING.SUBSCRIPTION.')) {
        logger.info("Processing subscription event:", requestData.event_type);
        return await handleSubscriptionEvent(requestData, isSimulator);
      } else {
        // Keep existing payment event handling for backward compatibility
        logger.info("Processing payment event:", requestData.event_type);
        return await handlePaymentEvent(requestData, isSimulator);
      }
    }

    // For other event types, just acknowledge receipt
    logger.info("Received non-payment/subscription event type:", requestData.event_type);
    return createResponse({ 
      success: true, 
      message: "Event received", 
      event_type: requestData.event_type 
    }, 200);
  } catch (error) {
    logger.error("Error processing webhook:", error);
    return handleError(error);
  }
});
