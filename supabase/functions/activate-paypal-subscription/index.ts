
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationRequest {
  subscriptionId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId }: ActivationRequest = await req.json();
    
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
        "Accept": "application/json"
      }
    });
    
    const subscription = await subscriptionResponse.json();
    console.log("PayPal subscription details:", subscription);
    
    if (subscription.status !== "ACTIVE") {
      throw new Error(`Subscription is not active. Status: ${subscription.status}`);
    }
    
    // Extract custom data to get plan type
    const customData = JSON.parse(subscription.custom_id || '{}');
    const planType = customData.planType || 'monthly';
    
    // Calculate period dates
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    
    if (planType === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update subscription in database
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        plan_type: planType,
        paypal_subscription_id: subscriptionId,
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: currentDate.toISOString()
      })
      .eq('user_id', userId)
      .select();
      
    if (error) {
      console.error('Error updating subscription:', error);
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
    
    console.log('Subscription activated successfully:', data);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: data[0],
        message: 'Subscription activated successfully'
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Error activating PayPal subscription:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
