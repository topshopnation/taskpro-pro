
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getPayPalConfig() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox";
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }
  
  const baseUrl = environment === "sandbox" 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com";
  
  return { clientId, clientSecret, baseUrl };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, userId } = await req.json();
    
    console.log("Canceling PayPal subscription:", { subscriptionId, userId });

    if (!subscriptionId || !userId) {
      throw new Error("Missing subscriptionId or userId");
    }

    // Get PayPal configuration
    const { clientId, clientSecret, baseUrl } = getPayPalConfig();
    const auth = btoa(`${clientId}:${clientSecret}`);
    
    // Get PayPal access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("PayPal token error:", tokenData);
      throw new Error("Failed to get PayPal access token");
    }

    // Cancel the subscription with PayPal
    const cancelResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'User requested cancellation'
      })
    });

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.text();
      console.error("PayPal cancellation error:", errorData);
      throw new Error("Failed to cancel PayPal subscription");
    }

    console.log("PayPal subscription canceled successfully");

    // Update subscription status in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('paypal_subscription_id', subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Database update error:", error);
      throw new Error("Failed to update subscription status");
    }

    console.log("Subscription status updated in database:", data);

    return new Response(JSON.stringify({ 
      success: true,
      subscription: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
