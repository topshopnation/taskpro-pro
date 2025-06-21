
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
    const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox";
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    // Use correct PayPal API URL based on environment
    const baseUrl = environment === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";
    
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
    
    // Get plan IDs from environment or use defaults
    const monthlyPlanId = Deno.env.get("PAYPAL_MONTHLY_PLAN_ID") || 'P-65H54700W12667836M7423DA';
    const yearlyPlanId = Deno.env.get("PAYPAL_YEARLY_PLAN_ID") || 'P-80L22294MH2379142M7422KA';
    
    const planId = planType === 'yearly' ? yearlyPlanId : monthlyPlanId;
    
    console.log("Using plan ID:", planId, "for plan type:", planType);
    
    // Create PayPal subscription with proper return/cancel URLs
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
        return_url: `${returnUrl}&subscription_id={subscription_id}`,
        cancel_url: cancelUrl
      },
      custom_id: JSON.stringify({ userId, planType })
    };
    
    console.log("Creating subscription with data:", JSON.stringify(subscriptionData, null, 2));
    
    const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
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
    console.log("PayPal subscription response:", JSON.stringify(subscription, null, 2));
    
    if (!subscriptionResponse.ok) {
      console.error("PayPal subscription creation failed:", subscription);
      throw new Error(`PayPal subscription creation failed: ${subscription.message || 'Unknown error'}`);
    }
    
    if (subscription.status === "APPROVAL_PENDING") {
      // Find the approval URL
      const approvalUrl = subscription.links?.find((link: any) => link.rel === "approve")?.href;
      
      if (!approvalUrl) {
        throw new Error("No approval URL found in PayPal response");
      }
      
      console.log("Subscription created successfully with approval URL:", approvalUrl);
      
      return new Response(
        JSON.stringify({ 
          approval_url: approvalUrl,
          subscription_id: subscription.id,
          status: subscription.status
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      throw new Error(`Unexpected PayPal subscription status: ${subscription.status}`);
    }
    
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to create PayPal subscription"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
