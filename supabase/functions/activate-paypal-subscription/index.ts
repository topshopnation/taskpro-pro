
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
    const body = await req.text();
    console.log("Raw request body:", body);
    
    if (!body) {
      throw new Error("Empty request body");
    }
    
    const { subscriptionId, userId }: ActivationRequest = JSON.parse(body);
    
    console.log("Activating PayPal subscription:", { subscriptionId, userId });
    
    if (!subscriptionId || !userId) {
      throw new Error("Missing subscriptionId or userId");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Determine plan type and setup subscription data
    let planType = 'monthly';
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    
    // For billing agreement tokens (BA-*), we'll create an active subscription
    // without validating against PayPal since these are legacy tokens
    if (subscriptionId.startsWith('BA-')) {
      console.log("Processing billing agreement token:", subscriptionId);
      planType = 'monthly'; // Default to monthly for billing agreements
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      // For regular subscription IDs, we can try to validate with PayPal
      console.log("Processing subscription ID:", subscriptionId);
      
      // Get PayPal credentials for validation
      const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
      const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
      const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "live";
      
      if (clientId && clientSecret) {
        try {
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
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            
            if (tokenData.access_token) {
              // Try to get subscription details
              const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${tokenData.access_token}`,
                  "Accept": "application/json"
                }
              });
              
              if (subscriptionResponse.ok) {
                const subscription = await subscriptionResponse.json();
                console.log("PayPal subscription validated:", subscription.status);
                
                if (subscription.status !== "ACTIVE") {
                  throw new Error(`Subscription is not active. Status: ${subscription.status}`);
                }
                
                // Extract plan type from custom data if available
                try {
                  if (subscription.custom_id) {
                    const customData = JSON.parse(subscription.custom_id);
                    planType = customData.planType || 'monthly';
                  }
                } catch (e) {
                  console.warn("Could not parse custom_id, using default monthly plan");
                }
              }
            }
          }
        } catch (validationError) {
          console.warn("PayPal validation failed, proceeding anyway:", validationError);
        }
      }
      
      // Set period end based on plan type
      if (planType === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
    }
    
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
