
-- Fix the subscription_plans RLS policies to remove admin checks that are causing infinite recursion
-- Drop all existing policies that might be causing the issue
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage all subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active plans or admins can view all" ON subscription_plans;
DROP POLICY IF EXISTS "Only admins can manage subscription plans" ON subscription_plans;

-- Create a simple policy that allows anyone to view active subscription plans
-- This is appropriate since subscription plans are meant to be publicly viewable
CREATE POLICY "Public read access to active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Create a separate admin-only policy for managing plans (insert, update, delete)
-- This uses a simpler approach that won't cause recursion
CREATE POLICY "Admin management of subscription plans"
  ON subscription_plans
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT profiles.id 
      FROM profiles 
      JOIN admin_users ON profiles.email = admin_users.email
    )
  );
