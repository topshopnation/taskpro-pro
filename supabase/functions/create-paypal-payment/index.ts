
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../paypal-webhook/cors.ts";

interface PaymentRequest {
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
    const { planType, userId, returnUrl, cancelUrl }: PaymentRequest = await req.json();
    
    console.log("Creating PayPal payment for:", { planType, userId });
    
    // Get PayPal credentials from environment
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    
    // Get PayPal access token
    const tokenResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
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
    
    // Determine price based on plan type
    const amount = planType === 'yearly' ? '15.00' : '2.00';
    const description = planType === 'yearly' ? 'TaskPro Pro - Yearly Subscription' : 'TaskPro Pro - Monthly Subscription';
    
    // Create PayPal payment
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: amount
        },
        description: description,
        custom_id: JSON.stringify({ userId, planType })
      }],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "TaskPro",
        user_action: "PAY_NOW"
      }
    };
    
    const paymentResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify(paymentData),
    });
    
    const payment = await paymentResponse.json();
    console.log("PayPal payment created:", payment);
    
    if (payment.status === "CREATED") {
      // Find the approval URL
      const approvalUrl = payment.links?.find((link: any) => link.rel === "approve")?.href;
      
      return new Response(
        JSON.stringify({ 
          approval_url: approvalUrl,
          payment_id: payment.id
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } else {
      throw new Error(`PayPal payment creation failed: ${payment.status}`);
    }
    
  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
