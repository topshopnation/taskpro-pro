
// Extend existing adminTypes.ts
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-uuid-1',
    email: 'admin@taskpro.pro',
    role: 'super_admin',
    created_at: new Date().toISOString(),
    last_login: undefined
  }
];

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
