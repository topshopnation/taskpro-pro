
-- Enable pgcrypto extension for password hashing functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure the admin_users table has proper RLS policies
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for admin users (since this is an admin-only table)
DROP POLICY IF EXISTS "Admin users can be accessed" ON public.admin_users;
CREATE POLICY "Admin users can be accessed" 
ON public.admin_users 
FOR ALL 
TO authenticated 
USING (true);
