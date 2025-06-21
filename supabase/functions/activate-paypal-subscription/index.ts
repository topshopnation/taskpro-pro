
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
    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox";
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    const baseUrl = environment === "sandbox" 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com";
    
    // Get PayPal access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Get subscription details from PayPal
    const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!subscriptionResponse.ok) {
      throw new Error(`Failed to get subscription details: ${subscriptionResponse.statusText}`);
    }
    
    const subscriptionData = await subscriptionResponse.json();
    console.log("💾 PayPal subscription data:", subscriptionData);
    
    // Extract plan details from custom_id
    let planType = 'monthly';
    try {
      const customData = JSON.parse(subscriptionData.custom_id || '{}');
      planType = customData.planType || 'monthly';
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
    
    // First, get the most recent subscription for this user
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
    
    // Update subscription data
    const subscriptionUpdateData = {
      status: 'active',
      plan_type: planType,
      paypal_subscription_id: subscriptionId,
      current_period_start: currentDate.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: currentDate.toISOString()
    };
    
    console.log("📝 Updating subscription in database:", subscriptionUpdateData);
    console.log("🎯 Targeting subscription ID:", targetSubscription.id);
    
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
    
    // If there are multiple subscriptions, clean up old trial ones
    if (existingSubscriptions.length > 1) {
      console.log("🧹 Cleaning up old trial subscriptions...");
      const oldSubscriptionIds = existingSubscriptions.slice(1).map(sub => sub.id);
      
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .in('id', oldSubscriptionIds);
      
      if (deleteError) {
        console.warn("⚠️ Error cleaning up old subscriptions:", deleteError);
        // Don't fail the main operation for cleanup errors
      } else {
        console.log("✅ Cleaned up old subscriptions");
      }
    }
    
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
