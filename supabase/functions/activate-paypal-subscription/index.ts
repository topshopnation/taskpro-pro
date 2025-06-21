
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
    
    if (!subscriptionId || !userId) {
      throw new Error("Missing subscriptionId or userId");
    }
    
    // Get PayPal credentials from environment
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "live";
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    // Use correct PayPal API URL based on environment
    const baseUrl = environment === "sandbox" 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com";
    
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
      console.error("PayPal token response:", tokenData);
      throw new Error("Failed to get PayPal access token");
    }
    
    // Check if this is a billing agreement token (ba_token) or subscription ID
    let subscription;
    let planType = 'monthly';
    
    if (subscriptionId.startsWith('BA-')) {
      // This is a billing agreement token, we need to convert it to a subscription
      console.log("Processing billing agreement token:", subscriptionId);
      
      // For billing agreements, we'll create a subscription record based on the agreement
      // First, let's get the billing agreement details
      const agreementResponse = await fetch(`${baseUrl}/v1/billing-agreements/${subscriptionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json"
        }
      });
      
      if (!agreementResponse.ok) {
        const errorData = await agreementResponse.json();
        console.error("Failed to get billing agreement details:", errorData);
        throw new Error(`Failed to get billing agreement details: ${errorData.message || 'Unknown error'}`);
      }
      
      const agreement = await agreementResponse.json();
      console.log("PayPal billing agreement details:", JSON.stringify(agreement, null, 2));
      
      if (agreement.state !== "Active") {
        throw new Error(`Billing agreement is not active. Status: ${agreement.state}`);
      }
      
      // Extract plan information from agreement
      if (agreement.plan && agreement.plan.payment_definitions) {
        const paymentDef = agreement.plan.payment_definitions[0];
        if (paymentDef && paymentDef.frequency === "Year") {
          planType = 'yearly';
        }
      }
      
      // Use the billing agreement as our subscription reference
      subscription = {
        id: subscriptionId,
        status: "ACTIVE",
        plan_id: agreement.plan?.id || "",
        billing_info: agreement
      };
      
    } else {
      // This should be a subscription ID, try to get it directly
      const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Accept": "application/json"
        }
      });
      
      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        console.error("Failed to get subscription details:", errorData);
        throw new Error(`Failed to get subscription details: ${errorData.message || 'Unknown error'}`);
      }
      
      subscription = await subscriptionResponse.json();
      console.log("PayPal subscription details:", JSON.stringify(subscription, null, 2));
      
      if (subscription.status !== "ACTIVE") {
        throw new Error(`Subscription is not active. Status: ${subscription.status}`);
      }
      
      // Extract custom data to get plan type
      try {
        if (subscription.custom_id) {
          const customData = JSON.parse(subscription.custom_id);
          planType = customData.planType || 'monthly';
        }
      } catch (e) {
        console.warn("Could not parse custom_id, defaulting to monthly plan");
      }
    }
    
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
    
    // First check if subscription exists for this user
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching existing subscription:', fetchError);
      throw new Error(`Failed to fetch existing subscription: ${fetchError.message}`);
    }
    
    const subscriptionData = {
      user_id: userId,
      status: 'active',
      plan_type: planType,
      paypal_subscription_id: subscriptionId,
      current_period_start: currentDate.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: currentDate.toISOString()
    };
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('user_id', userId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating subscription:', error);
        throw new Error(`Failed to update subscription: ${error.message}`);
      }
      
      result = data;
      console.log('Subscription updated successfully:', result);
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscriptionData,
          created_at: currentDate.toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating subscription:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }
      
      result = data;
      console.log('Subscription created successfully:', result);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        subscription: result,
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
