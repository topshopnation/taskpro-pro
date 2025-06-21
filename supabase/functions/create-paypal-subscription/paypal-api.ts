
import { PayPalTokenResponse, PayPalProduct, PayPalPlan, PayPalSubscription } from './types.ts';

export const getPayPalAccessToken = async (
  baseUrl: string, 
  clientId: string, 
  clientSecret: string
): Promise<string> => {
  console.log("🔑 Attempting to get PayPal access token...");
  console.log("🌐 Base URL:", baseUrl);
  console.log("🔧 Client ID (first 10 chars):", clientId.substring(0, 10) + "...");
  
  const auth = btoa(`${clientId}:${clientSecret}`);
  console.log("✅ Authorization header created");
  
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Accept-Language": "en_US",
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  
  console.log("📡 Token response status:", tokenResponse.status);
  
  const tokenData: PayPalTokenResponse = await tokenResponse.json();
  console.log("📄 Token response received");
  
  if (!tokenResponse.ok || !tokenData.access_token) {
    console.error("❌ PayPal token response:", tokenData);
    throw new Error(`Failed to get PayPal access token: ${tokenData.error_description || tokenData.error || 'Unknown error'}`);
  }
  
  console.log("✅ Successfully obtained PayPal access token");
  return tokenData.access_token;
};

export const createPayPalProduct = async (
  baseUrl: string,
  accessToken: string,
  plan: any,
  userId: string
): Promise<PayPalProduct> => {
  console.log("🏭 Creating PayPal product...");
  
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
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "PayPal-Request-Id": `PRODUCT-${userId}-${Date.now()}`
    },
    body: JSON.stringify(productData),
  });
  
  console.log("📦 Product response status:", productResponse.status);
  
  const product = await productResponse.json();
  
  if (!productResponse.ok) {
    console.error("❌ PayPal product creation failed:", product);
    throw new Error(`PayPal product creation failed: ${product.message || 'Unknown error'}`);
  }
  
  console.log("✅ PayPal product created:", product.id);
  return product;
};

export const createPayPalBillingPlan = async (
  baseUrl: string,
  accessToken: string,
  product: PayPalProduct,
  plan: any,
  planType: 'monthly' | 'yearly',
  userId: string
): Promise<PayPalPlan> => {
  console.log("📋 Creating PayPal billing plan for:", planType);
  
  const interval = planType === 'yearly' ? 'YEAR' : 'MONTH';
  const planPrice = planType === 'yearly' ? plan.price_yearly : plan.price_monthly;
  
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
        total_cycles: 0,
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
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "PayPal-Request-Id": `PLAN-${userId}-${Date.now()}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(billingPlanData),
  });
  
  console.log("📋 Plan response status:", planResponse.status);
  
  const paypalPlan = await planResponse.json();
  
  if (!planResponse.ok) {
    console.error("❌ PayPal plan creation failed:", paypalPlan);
    throw new Error(`PayPal plan creation failed: ${paypalPlan.message || 'Unknown error'}`);
  }
  
  console.log("✅ PayPal plan created:", paypalPlan.id);
  return paypalPlan;
};

export const createPayPalSubscription = async (
  baseUrl: string,
  accessToken: string,
  paypalPlan: PayPalPlan,
  returnUrl: string,
  cancelUrl: string,
  userId: string,
  planType: 'monthly' | 'yearly',
  dbPlanId: string
): Promise<PayPalSubscription> => {
  console.log("💳 Creating PayPal subscription...");
  
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
      return_url: returnUrl,
      cancel_url: cancelUrl
    },
    custom_id: JSON.stringify({ userId, planType, dbPlanId })
  };
  
  console.log("📝 Creating subscription with data:", JSON.stringify(subscriptionData, null, 2));
  
  const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "PayPal-Request-Id": `TASKPRO-${userId}-${Date.now()}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(subscriptionData),
  });
  
  console.log("💳 Subscription response status:", subscriptionResponse.status);
  
  const subscription = await subscriptionResponse.json();
  console.log("📄 PayPal subscription response received");
  
  if (!subscriptionResponse.ok) {
    console.error("❌ PayPal subscription creation failed:", subscription);
    throw new Error(`PayPal subscription creation failed: ${subscription.message || 'Unknown error'}`);
  }
  
  console.log("✅ PayPal subscription created:", subscription.id);
  return subscription;
};
