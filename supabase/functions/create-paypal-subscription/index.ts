
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SubscriptionRequest } from './types.ts';
import { getPayPalConfig, getReturnUrls } from './config.ts';
import { 
  getPayPalAccessToken, 
  createPayPalProduct, 
  createPayPalBillingPlan, 
  createPayPalSubscription 
} from './paypal-api.ts';
import { getSubscriptionPlan, validatePlanPricing } from './subscription-service.ts';

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
    const { planType, userId }: SubscriptionRequest = await req.json();
    
    console.log("Creating PayPal subscription for:", { planType, userId });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get subscription plan and validate pricing
    const plan = await getSubscriptionPlan(supabase);
    console.log('Using paid subscription plan from database:', plan);
    
    const planPrice = validatePlanPricing(plan, planType);
    
    // Get PayPal configuration
    const { clientId, clientSecret, baseUrl } = getPayPalConfig();
    const { returnUrl, cancelUrl } = getReturnUrls(supabaseUrl);
    
    console.log("Using return URLs:", { returnUrl, cancelUrl });
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    
    // Create PayPal product
    const product = await createPayPalProduct(baseUrl, accessToken, plan, userId);
    
    // Create PayPal billing plan
    const paypalPlan = await createPayPalBillingPlan(
      baseUrl, 
      accessToken, 
      product, 
      plan, 
      planType, 
      userId
    );
    
    // Create PayPal subscription
    const subscription = await createPayPalSubscription(
      baseUrl,
      accessToken,
      paypalPlan,
      returnUrl,
      cancelUrl,
      userId,
      planType,
      plan.id
    );
    
    if (subscription.status === "APPROVAL_PENDING") {
      const approvalUrl = subscription.links?.find((link: any) => link.rel === "approve")?.href;
      
      if (!approvalUrl) {
        throw new Error("No approval URL found in PayPal response");
      }
      
      // Store the subscription ID to be included in the return URL
      const modifiedReturnUrl = `${returnUrl}&subscription_id=${subscription.id}&plan_type=${planType}`;
      
      // Modify the approval URL to include the subscription ID in the return URL
      const urlObj = new URL(approvalUrl);
      urlObj.searchParams.set('return_url', modifiedReturnUrl);
      
      console.log("Subscription created successfully with approval URL:", urlObj.toString());
      console.log("PayPal subscription ID:", subscription.id);
      
      return new Response(
        JSON.stringify({ 
          approval_url: urlObj.toString(),
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
