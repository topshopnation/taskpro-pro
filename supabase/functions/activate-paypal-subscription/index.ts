
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

interface ActivateRequest {
  subscriptionId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId }: ActivateRequest = await req.json();
    
    console.log("Activating PayPal subscription:", { subscriptionId, userId });
    
    // Get PayPal credentials from environment
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    // Get PayPal access token
    const tokenResponse = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
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
    
    // Get subscription details from PayPal
    const subscriptionResponse = await fetch(`https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });
    
    const subscriptionDetails = await subscriptionResponse.json();
    console.log("PayPal subscription details:", subscriptionDetails);
    
    if (subscriptionDetails.status === "ACTIVE") {
      // Extract plan information
      const customData = JSON.parse(subscriptionDetails.custom_id || '{}');
      const planType = customData.planType || 'monthly';
      
      // Calculate next billing date
      const currentDate = new Date();
      const nextBillingDate = new Date(subscriptionDetails.billing_info?.next_billing_time || currentDate);
      
      // Update subscription in database
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          status: 'active',
          plan_type: planType,
          paypal_subscription_id: subscriptionId,
          current_period_start: currentDate.toISOString(),
          current_period_end: nextBillingDate.toISOString(),
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
          subscriptionId,
          nextBillingDate: nextBillingDate.toISOString()
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      throw new Error(`PayPal subscription not active: ${subscriptionDetails.status}`);
    }
    
  } catch (error) {
    console.error("Error activating PayPal subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
