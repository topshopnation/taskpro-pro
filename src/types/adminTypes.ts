
export type AdminRole = 'super_admin' | 'admin' | 'support';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_login?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionData {
  id: string;
  user_id: string;
  email: string;
  subscription_status: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  is_trial: boolean;
}

export interface UserActivity {
  id: string;
  user_id: string;
  email: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  trial_users: number;
  expired_subscriptions: number;
  revenue_monthly: number;
  revenue_yearly: number;
}
