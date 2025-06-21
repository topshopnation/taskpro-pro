
export function getPayPalConfig() {
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

export function getReturnUrls() {
  // Use production domain instead of Supabase URL
  const baseUrl = "https://taskpro.pro";
  
  const returnUrl = `${baseUrl}/settings?subscription_success=true`;
  const cancelUrl = `${baseUrl}/settings?subscription_cancelled=true`;
  
  return { returnUrl, cancelUrl };
}
