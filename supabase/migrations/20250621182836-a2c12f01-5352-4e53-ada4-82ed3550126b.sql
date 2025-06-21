
-- First, drop existing RLS policies on admin_users to stop the infinite recursion
DROP POLICY IF EXISTS "Admin users can view all admin accounts" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin accounts" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;

-- Disable RLS temporarily on admin_users to allow the security definer function to work
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Create a security definer function that bypasses RLS to check admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user exists in admin_users table
  -- This function runs with elevated privileges, bypassing RLS
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

-- Now create proper RLS policies for other tables that need admin access
-- Update profiles table RLS to allow admins to see all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = id OR public.is_current_user_admin()
);

CREATE POLICY "Users can update own profile or admins can update all" 
ON public.profiles FOR UPDATE 
USING (
  auth.uid() = id OR public.is_current_user_admin()
);

CREATE POLICY "Users can insert own profile or admins can insert all" 
ON public.profiles FOR INSERT 
WITH CHECK (
  auth.uid() = id OR public.is_current_user_admin()
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Update subscriptions table RLS to allow admins to see all subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription or admins can view all" 
ON public.subscriptions FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can update own subscription or admins can update all" 
ON public.subscriptions FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can insert own subscription or admins can insert all" 
ON public.subscriptions FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR public.is_current_user_admin()
);

-- Enable RLS on subscriptions if not already enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Update subscription_plans table RLS to allow public read access and admin write access
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Only admins can manage subscription plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view active plans or admins can view all" 
ON public.subscription_plans FOR SELECT 
USING (
  is_active = true OR public.is_current_user_admin()
);

CREATE POLICY "Only admins can manage subscription plans" 
ON public.subscription_plans FOR ALL 
USING (public.is_current_user_admin());

-- Enable RLS on subscription_plans if not already enabled
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Update other tables to allow admin access
-- Tasks table
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks or admins can view all" 
ON public.tasks FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can update own tasks or admins can update all" 
ON public.tasks FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can insert own tasks or admins can insert all" 
ON public.tasks FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can delete own tasks or admins can delete all" 
ON public.tasks FOR DELETE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

-- Enable RLS on tasks if not already enabled
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Projects table
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects or admins can view all" 
ON public.projects FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can update own projects or admins can update all" 
ON public.projects FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can insert own projects or admins can insert all" 
ON public.projects FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can delete own projects or admins can delete all" 
ON public.projects FOR DELETE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

-- Enable RLS on projects if not already enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Filters table
DROP POLICY IF EXISTS "Users can view own filters" ON public.filters;
DROP POLICY IF EXISTS "Users can update own filters" ON public.filters;
DROP POLICY IF EXISTS "Users can insert own filters" ON public.filters;
DROP POLICY IF EXISTS "Users can delete own filters" ON public.filters;

CREATE POLICY "Users can view own filters or admins can view all" 
ON public.filters FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can update own filters or admins can update all" 
ON public.filters FOR UPDATE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can insert own filters or admins can insert all" 
ON public.filters FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR public.is_current_user_admin()
);

CREATE POLICY "Users can delete own filters or admins can delete all" 
ON public.filters FOR DELETE 
USING (
  auth.uid() = user_id OR public.is_current_user_admin()
);

-- Enable RLS on filters if not already enabled
ALTER TABLE public.filters ENABLE ROW LEVEL SECURITY;
