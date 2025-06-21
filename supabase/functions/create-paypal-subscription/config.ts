
export function getPayPalConfig() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "production"; // Changed default to production
  
  console.log("🔧 PayPal Environment:", environment);
  console.log("🔧 PayPal Client ID exists:", !!clientId);
  console.log("🔧 PayPal Client Secret exists:", !!clientSecret);
  
  if (!clientId || !clientSecret) {
    throw new Error(`PayPal credentials not configured. ClientID: ${!!clientId}, ClientSecret: ${!!clientSecret}`);
  }
  
  const baseUrl = environment === "production" 
    ? "https://api-m.paypal.com" 
    : "https://api-m.sandbox.paypal.com";
  
  console.log("🌐 Using PayPal Base URL:", baseUrl);
  
  return { clientId, clientSecret, baseUrl };
}

export function getReturnUrls() {
  // Use production domain
  const baseUrl = "https://taskpro.pro";
  
  const returnUrl = `${baseUrl}/settings?subscription_success=true`;
  const cancelUrl = `${baseUrl}/settings?subscription_cancelled=true`;
  
  console.log("🔗 Return URLs configured:", { returnUrl, cancelUrl });
  
  return { returnUrl, cancelUrl };
}
