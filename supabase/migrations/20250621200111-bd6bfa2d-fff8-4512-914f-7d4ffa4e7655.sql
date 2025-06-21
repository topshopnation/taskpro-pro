
-- Completely disable RLS on subscription_plans since these should be publicly readable
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- Drop any remaining policies that might be causing issues
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Public read access to active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admin management of subscription plans" ON subscription_plans;
