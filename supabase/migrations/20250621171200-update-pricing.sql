
-- Update subscription plan pricing
UPDATE public.subscription_plans 
SET 
  price_monthly = 2.00,
  price_yearly = 15.00,
  updated_at = now()
WHERE name = 'Free Trial';

-- If there are other active plans, we can also create a new plan with the updated pricing
INSERT INTO public.subscription_plans (
  name,
  description,
  price_monthly,
  price_yearly,
  features,
  is_active
) VALUES (
  'TaskPro Pro',
  'Full access to all TaskPro features with priority support',
  2.00,
  15.00,
  '["Unlimited tasks", "All project features", "Smart filters", "Task scheduling", "Priority support", "Advanced analytics"]'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  price_monthly = 2.00,
  price_yearly = 15.00,
  updated_at = now();
