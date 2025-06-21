
-- Remove ALL policies from subscription_plans to eliminate admin-related recursion
DROP POLICY IF EXISTS "Public read access to active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admin management of subscription plans" ON subscription_plans;

-- Create a simple public read policy with NO admin checks whatsoever
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- For now, we'll skip admin management policies to avoid any recursion issues
-- Admin functionality can be handled separately in the admin pages
