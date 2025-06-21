
-- Insert a trial plan into subscription_plans table
INSERT INTO public.subscription_plans (
  name,
  description,
  price_monthly,
  price_yearly,
  features,
  is_active
) VALUES (
  'Free Trial',
  '14-day free trial with full access to all features',
  0,
  0,
  '["Unlimited tasks", "All project features", "Smart filters", "Task scheduling", "Priority support"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;
