
export const getPayPalConfig = () => {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const environment = Deno.env.get("PAYPAL_ENVIRONMENT") || "sandbox"; // Changed default to sandbox
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }
  
  const baseUrl = environment === "sandbox" 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com";
    
  return { clientId, clientSecret, baseUrl };
};

export const getReturnUrls = (supabaseUrl: string) => {
  const baseReturnUrl = `${supabaseUrl.replace('/supabase', '')}/settings`;
  const returnUrl = `${baseReturnUrl}?subscription_success=true`;
  const cancelUrl = `${baseReturnUrl}?subscription_cancelled=true`;
  
  return { returnUrl, cancelUrl };
};
