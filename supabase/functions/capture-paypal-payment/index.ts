
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

interface CaptureRequest {
  paymentId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, userId }: CaptureRequest = await req.json();
    
    console.log("Capturing PayPal payment:", { paymentId, userId });
    
    // Get PayPal credentials from environment
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "live"; // Default to live
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    // Use correct PayPal API URL based on environment
    const baseUrl = environment === "sandbox" 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com"; // Live environment
    
    // Get PayPal access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error("Failed to get PayPal access token");
    }
    
    // Capture the payment
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });
    
    const captureData = await captureResponse.json();
    console.log("PayPal capture response:", captureData);
    
    if (captureData.status === "COMPLETED") {
      // Extract plan type from custom_id
      const customData = JSON.parse(captureData.purchase_units[0].custom_id || '{}');
      const planType = customData.planType || 'monthly';
      
      // Update subscription in database
      const supabase = getSupabaseClient();
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      
      if (planType === "monthly") {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
      
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_type: planType,
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating subscription:', error);
        throw new Error('Failed to update subscription');
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          planType,
          captureId: captureData.id
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      throw new Error(`PayPal capture failed: ${captureData.status}`);
    }
    
  } catch (error) {
    console.error("Error capturing PayPal payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
