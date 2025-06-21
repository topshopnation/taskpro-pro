
-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Admin users can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all subscriptions" ON subscriptions;

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user email exists in admin_users table
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on subscription_plans if not already enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for subscription plans that allows admin access
CREATE POLICY "Admins can manage subscription plans" 
ON subscription_plans 
FOR ALL 
USING (public.is_admin_user());

-- Enable RLS on profiles if not already enabled  
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles that allows users to see their own profile and admins to see all
CREATE POLICY "Users can view own profile, admins can view all" 
ON profiles 
FOR SELECT 
USING (id = auth.uid() OR public.is_admin_user());

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles" 
ON profiles 
FOR UPDATE 
USING (public.is_admin_user());

-- Enable RLS on subscriptions if not already enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for subscriptions that allows users to see their own and admins to see all
CREATE POLICY "Users can view own subscription, admins can view all" 
ON subscriptions 
FOR SELECT 
USING (user_id = auth.uid() OR public.is_admin_user());

-- Allow admins to update subscriptions
CREATE POLICY "Admins can update subscriptions" 
ON subscriptions 
FOR UPDATE 
USING (public.is_admin_user());
