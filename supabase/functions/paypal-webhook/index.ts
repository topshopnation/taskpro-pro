
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = "https://rfjydtygaymoovkkmyuj.supabase.co";
const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify that the request is coming from PayPal
    const paypalWebhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
    
    // Get PayPal headers for verification
    const paypalTransmissionId = req.headers.get("paypal-transmission-id");
    const paypalTimestamp = req.headers.get("paypal-transmission-time");
    const paypalSignature = req.headers.get("paypal-transmission-sig");
    const paypalCertUrl = req.headers.get("paypal-cert-url");
    
    // For now, we'll log these but implement proper verification later
    console.log("PayPal Headers:", {
      paypalTransmissionId,
      paypalTimestamp,
      paypalSignature,
      paypalCertUrl,
      paypalWebhookId,
    });

    // Get the webhook event data
    const requestData = await req.json();
    console.log("PayPal Webhook Event:", JSON.stringify(requestData));

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if it's a payment completion event
    if (
      requestData.event_type === "PAYMENT.SALE.COMPLETED" ||
      requestData.event_type === "BILLING.SUBSCRIPTION.RENEWED"
    ) {
      // Extract relevant data from the webhook
      const paymentData = requestData.resource;
      
      // Check if this is a subscription payment
      const billingAgreementId = paymentData.billing_agreement_id;
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
      
      if (!customData) {
        console.log("No custom data found in PayPal webhook");
        return new Response(
          JSON.stringify({ error: "Missing custom data" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      // Parse the custom data
      // Format should be: {"user_id":"some-uuid","plan_type":"monthly|yearly"}
      let userData;
      try {
        userData = JSON.parse(customData);
      } catch (e) {
        console.error("Failed to parse custom data:", customData);
        return new Response(
          JSON.stringify({ error: "Invalid custom data format" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const { user_id, plan_type } = userData;
      
      if (!user_id || !plan_type) {
        console.error("Missing user_id or plan_type in custom data:", userData);
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

      // Update the subscription in the database
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
