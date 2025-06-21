
export interface SubscriptionRequest {
  planType: 'monthly' | 'yearly';
  userId: string;
}

export interface PayPalTokenResponse {
  access_token: string;
}

export interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
}

export interface PayPalPlan {
  id: string;
  name: string;
  description: string;
  status: string;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  links?: Array<{
    rel: string;
    href: string;
  }>;
}
