
-- First, let's drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Admin users can manage admin data" ON admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin user access" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can view admin_users for admin check" ON admin_users;

-- Drop existing subscription_plans policies
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Public can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage all subscription plans" ON subscription_plans;

-- Drop existing profiles policies
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop existing subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription, admins can view all" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if current user exists in admin_users table
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = (
      SELECT email 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );
END;
$$;

-- Create RLS policies for admin_users table
CREATE POLICY "Authenticated users can view admin_users for admin check"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for subscription_plans table  
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin());

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin());

-- Create RLS policies for subscriptions table
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin());
