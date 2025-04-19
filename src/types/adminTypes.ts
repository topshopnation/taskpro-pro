
// Define admin role types
export type AdminRole = 'super_admin' | 'admin' | 'support';

// Define admin user interface
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

// Define subscription plan interface
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

// Define user activity interface for admin logs
export interface UserActivity {
  id: string;
  user_id: string;
  email: string;
  action: string;
  details: string;
  timestamp: string;
}

// Define user profile interface for admin views
export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
  role?: string;
  subscription_status?: string;
  plan_type?: string;
}

// Mock data for admin users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-uuid-1',
    email: 'admin@taskpro.pro',
    role: 'super_admin',
    created_at: new Date().toISOString(),
    last_login: undefined
  }
];

// Mock data for subscription plans
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-uuid-1',
    name: 'Free Tier',
    description: 'Basic plan for new users',
    price_monthly: 0,
    price_yearly: 0,
    features: ['Basic task management'],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
