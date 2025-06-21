
-- Enable RLS on subscription_plans if not already enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;

-- Create policy for subscription plans that allows admin access
CREATE POLICY "Admins can manage subscription plans" 
ON subscription_plans 
FOR ALL 
USING (public.is_admin_user());

-- Also allow public read access for active plans (for the pricing display)
CREATE POLICY "Public can view active subscription plans" 
ON subscription_plans 
FOR SELECT 
USING (is_active = true);
