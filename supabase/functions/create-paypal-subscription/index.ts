
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get ONLY paid subscription plans from database
    const { data: plans, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .gt('price_monthly', 0) // Only get plans with actual pricing
      .order('created_at', { ascending: false });
    
    if (planError) {
      console.error('Error fetching subscription plans:', planError);
      throw new Error('Failed to fetch subscription plans');
    }
    
    if (!plans || plans.length === 0) {
      console.error('No paid subscription plans found');
      throw new Error('No paid subscription plans are currently available');
    }
    
    // Use the most recent paid plan
    const plan = plans[0];
    console.log('Using paid subscription plan from database:', plan);
    
    // Verify the plan has valid pricing for the requested plan type
    const planPrice = planType === 'yearly' ? plan.price_yearly : plan.price_monthly;
    if (!planPrice || planPrice <= 0) {
      console.error(`Invalid pricing for ${planType} plan:`, planPrice);
      throw new Error(`${planType} plan pricing is not available`);
    }
    
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
      console.error("PayPal token response:", tokenData);
      throw new Error("Failed to get PayPal access token");
    }
    
    // Create PayPal plan dynamically based on database values
    const interval = planType === 'yearly' ? 'YEAR' : 'MONTH';
    
    // First create a PayPal product
    const productData = {
      name: plan.name,
      description: plan.description || `${plan.name} subscription`,
      type: "SERVICE",
      category: "SOFTWARE"
    };
    
    const productResponse = await fetch(`${baseUrl}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
        "PayPal-Request-Id": `PRODUCT-${userId}-${Date.now()}`
      },
      body: JSON.stringify(productData),
    });
    
    const product = await productResponse.json();
    
    if (!productResponse.ok) {
      console.error("PayPal product creation failed:", product);
      throw new Error(`PayPal product creation failed: ${product.message || 'Unknown error'}`);
    }
    
    console.log("PayPal product created:", product);
    
    // Now create a billing plan
    const billingPlanData = {
      product_id: product.id,
      name: `${plan.name} - ${planType}`,
      description: `${plan.name} ${planType} subscription`,
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: interval,
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 means infinite
          pricing_scheme: {
            fixed_price: {
              value: planPrice.toString(),
              currency_code: "USD"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      }
    };
    
    const planResponse = await fetch(`${baseUrl}/v1/billing/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
        "PayPal-Request-Id": `PLAN-${userId}-${Date.now()}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(billingPlanData),
    });
    
    const paypalPlan = await planResponse.json();
    
    if (!planResponse.ok) {
      console.error("PayPal plan creation failed:", paypalPlan);
      throw new Error(`PayPal plan creation failed: ${paypalPlan.message || 'Unknown error'}`);
    }
    
    console.log("PayPal plan created:", paypalPlan);
    
    // Create PayPal subscription with the dynamic plan
    const subscriptionData = {
      plan_id: paypalPlan.id,
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
        return_url: `${returnUrl}&subscription_id={{subscription_id}}`,
        cancel_url: cancelUrl
      },
      custom_id: JSON.stringify({ userId, planType, dbPlanId: plan.id })
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
      let approvalUrl = subscription.links?.find((link: any) => link.rel === "approve")?.href;
      
      if (!approvalUrl) {
        throw new Error("No approval URL found in PayPal response");
      }
      
      // Replace the subscription_id placeholder with the actual subscription ID
      approvalUrl = approvalUrl.replace('{{subscription_id}}', subscription.id);
      
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
