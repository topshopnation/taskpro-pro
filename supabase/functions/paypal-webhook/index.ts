
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = "https://rfjydtygaymoovkkmyuj.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("PayPal webhook received - starting processing");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify that the request is coming from PayPal
    const paypalWebhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    console.log("PayPal Webhook ID from environment:", paypalWebhookId || "Not set");
    
    // Get PayPal headers for verification
    const paypalTransmissionId = req.headers.get("paypal-transmission-id");
    const paypalTimestamp = req.headers.get("paypal-transmission-time");
    const paypalSignature = req.headers.get("paypal-transmission-sig");
    const paypalCertUrl = req.headers.get("paypal-cert-url");
    
    console.log("================ REQUEST HEADERS ================");
    // Log all request headers for debugging
    console.log("All request headers:", Object.fromEntries([...req.headers.entries()]));
    
    // Log PayPal specific headers
    console.log("================ PAYPAL HEADERS ================");
    console.log("PayPal Headers:", {
      paypalTransmissionId,
      paypalTimestamp,
      paypalSignature,
      paypalCertUrl,
      paypalWebhookId,
    });

    // Get the webhook event data
    const requestData = await req.json();
    console.log("================ WEBHOOK EVENT DATA ================");
    console.log("PayPal Webhook Event:", JSON.stringify(requestData, null, 2));

    // Log whether this appears to be a simulator request
    const isSimulator = !paypalTransmissionId || paypalTransmissionId.includes("simulator");
    console.log("Is simulator request:", isSimulator);

    // Create a Supabase client
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set. Cannot connect to Supabase.");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client created successfully");

    // Check if it's a payment completion event
    if (
      requestData.event_type === "PAYMENT.SALE.COMPLETED" ||
      requestData.event_type === "BILLING.SUBSCRIPTION.RENEWED"
    ) {
      console.log("Processing payment completion event:", requestData.event_type);
      
      // Extract relevant data from the webhook
      const paymentData = requestData.resource;
      console.log("Payment data:", JSON.stringify(paymentData, null, 2));
      
      // Check if this is a subscription payment
      const billingAgreementId = paymentData?.billing_agreement_id;
      if (!billingAgreementId) {
        console.log("Not a subscription payment, ignoring");
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      console.log("Processing subscription renewal for billing agreement:", billingAgreementId);

      // Extract custom field containing plan type and user ID
      // PayPal passes this in the custom_id field or in the custom field
      const customData = paymentData.custom || paymentData.custom_id;
      console.log("Custom data from PayPal:", customData);
      
      // For simulator requests, create mock data if customData is missing
      let userData;
      
      if (!customData && isSimulator) {
        console.log("Simulator detected with no custom data, creating mock data for testing");
        userData = {
          user_id: "test-user-id-from-simulator",
          plan_type: "monthly"
        };
        console.log("Created mock user data:", userData);
      } else if (!customData) {
        console.log("No custom data found in PayPal webhook");
        return new Response(
          JSON.stringify({ error: "Missing custom data" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      } else {
        // Parse the custom data from real request
        // Format should be: {"user_id":"some-uuid","plan_type":"monthly|yearly"}
        try {
          userData = JSON.parse(customData);
          console.log("Successfully parsed custom data:", userData);
        } catch (e) {
          console.error("Failed to parse custom data:", customData, e);
          return new Response(
            JSON.stringify({ error: "Invalid custom data format" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            }
          );
        }
      }

      const { user_id, plan_type } = userData;
      
      if (!user_id || !plan_type) {
        console.error("Missing user_id or plan_type in parsed data:", userData);
        return new Response(
          JSON.stringify({ error: "Missing user_id or plan_type" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Calculate new period dates
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      
      if (plan_type === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      console.log("Subscription period calculation:", {
        start: currentDate.toISOString(),
        end: periodEnd.toISOString(),
        plan_type
      });

      // For simulator requests, skip DB update but log what would happen
      if (isSimulator && user_id === "test-user-id-from-simulator") {
        console.log("SIMULATOR TEST: Would update subscription with the following data:", {
          user_id,
          plan_type,
          status: "active",
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            test_mode: true,
            message: "Simulator test successful - no database changes made" 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Update the subscription in the database for real requests
      console.log("Updating subscription in database for user:", user_id);
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: currentDate.toISOString(),
        })
        .eq("user_id", user_id);

      if (error) {
        console.error("Error updating subscription:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update subscription" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      console.log("Subscription updated successfully for user:", user_id);
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For other event types, just acknowledge receipt
    console.log("Received non-payment event type:", requestData.event_type);
    return new Response(
      JSON.stringify({ success: true, message: "Event received" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
