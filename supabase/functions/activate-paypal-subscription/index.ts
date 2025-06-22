
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for all responses
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
    const { subscriptionId, userId } = await req.json();
    
    console.log("🚀 Activating PayPal subscription:", { subscriptionId, userId });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get PayPal configuration
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "production";
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    console.log("🔧 PayPal Environment:", environment);
    console.log("🔧 Using PayPal Client ID:", clientId.substring(0, 10) + "...");
    
    const baseUrl = environment === "production" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";
    
    console.log("🌐 PayPal Base URL:", baseUrl);
    
    // Get PayPal access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    console.log("🔑 Token response status:", tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("❌ Failed to get PayPal access token:", errorText);
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    console.log("✅ Successfully obtained PayPal access token");
    
    // Check if we already have an active subscription for this user
    const { data: existingSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error("❌ Error fetching subscriptions:", fetchError);
      throw new Error(`Failed to fetch subscriptions: ${fetchError.message}`);
    }
    
    console.log("📋 Found existing subscriptions:", existingSubscriptions?.length || 0);
    
    if (!existingSubscriptions || existingSubscriptions.length === 0) {
      throw new Error("No subscription found for user");
    }
    
    // Use the most recent subscription
    const targetSubscription = existingSubscriptions[0];
    
    // If subscription is already active, just return success
    if (targetSubscription.status === 'active' && targetSubscription.paypal_subscription_id) {
      console.log("✅ Subscription already active, returning success");
      return new Response(
        JSON.stringify({ 
          success: true,
          subscription: targetSubscription,
          message: "Subscription already active"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // For billing agreement tokens, try to find the actual subscription ID
    let actualSubscriptionId = subscriptionId;
    let planType = 'monthly';
    let subscriptionData = null;
    
    if (subscriptionId.startsWith('BA-')) {
      console.log("📋 Processing PayPal billing agreement token:", subscriptionId);
      
      // Check if we can find an active subscription that matches this user
      // This handles cases where PayPal webhooks already activated the subscription
      const { data: recentSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .not('paypal_subscription_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (recentSubs && recentSubs.length > 0) {
        console.log("✅ Found recently activated subscription via webhook:", recentSubs[0].paypal_subscription_id);
        return new Response(
          JSON.stringify({ 
            success: true,
            subscription: recentSubs[0],
            message: "Subscription already activated via webhook"
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }
      
      // If no active subscription found, create a basic active subscription
      // The webhook will update it with proper PayPal details later
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      periodEnd.setMonth(periodEnd.getMonth() + 1); // Default to monthly
      
      const subscriptionUpdateData = {
        status: 'active',
        plan_type: 'monthly',
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: currentDate.toISOString()
      };
      
      console.log("📝 Updating subscription to active status:", subscriptionUpdateData);
      
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionUpdateData)
        .eq('id', targetSubscription.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("❌ Error updating subscription:", updateError);
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      
      console.log("✅ Subscription updated successfully, webhook will add PayPal details");
      
      return new Response(
        JSON.stringify({ 
          success: true,
          subscription: updatedSubscription,
          message: "Subscription activated, PayPal details will be updated via webhook"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Handle regular subscription IDs (I- format)
    if (subscriptionId.startsWith('I-')) {
      console.log("📋 Processing PayPal subscription:", subscriptionId);
      
      const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!subscriptionResponse.ok) {
        const errorText = await subscriptionResponse.text();
        console.error("❌ Failed to get subscription details:", errorText);
        throw new Error(`Failed to get subscription details: ${subscriptionResponse.status} ${errorText}`);
      }
      
      subscriptionData = await subscriptionResponse.json();
      console.log("💾 PayPal subscription data:", JSON.stringify(subscriptionData, null, 2));
      
      // Extract plan details from custom_id
      try {
        const customData = JSON.parse(subscriptionData.custom_id || '{}');
        planType = customData.planType || 'monthly';
        console.log("📦 Extracted plan type from subscription:", planType);
      } catch (e) {
        console.warn("⚠️ Could not parse custom_id, defaulting to monthly");
      }
      
      // Calculate subscription period
      const currentDate = new Date();
      const periodEnd = new Date(currentDate);
      
      if (planType === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }
      
      const subscriptionUpdateData = {
        status: 'active',
        plan_type: planType,
        paypal_subscription_id: subscriptionId,
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: currentDate.toISOString()
      };
      
      console.log("📝 Updating subscription in database:", subscriptionUpdateData);
      
      const { data: updatedSubscription, error: updateError } = await supabase
        .from('subscriptions')
        .update(subscriptionUpdateData)
        .eq('id', targetSubscription.id)
        .select()
        .single();
      
      if (updateError) {
        console.error("❌ Error updating subscription:", updateError);
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      
      console.log("✅ Subscription updated successfully:", updatedSubscription);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          subscription: updatedSubscription,
          paypal_status: subscriptionData.status,
          message: "Subscription activated successfully"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    throw new Error(`Unknown subscription ID format: ${subscriptionId}`);
    
  } catch (error) {
    console.error("💥 Error activating subscription:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Failed to activate subscription"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
