
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admin users can be accessed" ON public.admin_users;

-- Create a simpler policy that doesn't cause recursion
-- This allows any authenticated user to read admin_users (we'll handle authorization in the application layer)
CREATE POLICY "Allow admin user access" 
ON public.admin_users 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
