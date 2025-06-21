
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  planType: 'monthly' | 'yearly';
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, userId, returnUrl, cancelUrl }: SubscriptionRequest = await req.json();
    
    console.log("Creating PayPal subscription for:", { planType, userId });
    
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
    
    // Use your actual PayPal Plan IDs from the screenshot
    const planId = planType === 'yearly' 
      ? 'P-80L22294MH2379142M74Z2KA'  // TaskPro Annual Subscription
      : 'P-65H54700W1266783QM743DA';  // TaskPro Monthly Subscription
    
    // Create PayPal subscription
    const subscriptionData = {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: "TaskPro",
          surname: "User"
        }
      },
      application_context: {
        brand_name: "TaskPro",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: returnUrl,
        cancel_url: cancelUrl
      },
      custom_id: JSON.stringify({ userId, planType })
    };
    
    const subscriptionResponse = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
        "PayPal-Request-Id": `TASKPRO-${userId}-${Date.now()}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(subscriptionData),
    });
    
    const subscription = await subscriptionResponse.json();
    console.log("PayPal subscription created:", subscription);
    
    if (subscription.status === "APPROVAL_PENDING") {
      // Find the approval URL
      const approvalUrl = subscription.links?.find((link: any) => link.rel === "approve")?.href;
      
      return new Response(
        JSON.stringify({ 
          approval_url: approvalUrl,
          subscription_id: subscription.id
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      throw new Error(`PayPal subscription creation failed: ${subscription.status}`);
    }
    
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
