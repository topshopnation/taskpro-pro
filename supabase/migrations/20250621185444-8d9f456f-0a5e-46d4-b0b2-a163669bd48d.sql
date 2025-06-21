
-- Enable Row Level Security on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_users table
CREATE POLICY "Admin users can view their own record" 
  ON public.admin_users 
  FOR SELECT 
  USING (email = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admin users can update their own record" 
  ON public.admin_users 
  FOR UPDATE 
  USING (email = (
    SELECT email FROM public.profiles WHERE id = auth.uid()
  ));

-- Fix the update_admin_password function to work without crypt
CREATE OR REPLACE FUNCTION public.update_admin_password(admin_email text, old_password text, new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Skip old password verification when old_password is empty
  IF old_password != '' THEN
    -- Verify the old password only if provided
    IF NOT EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE email = admin_email 
      AND password_hash = old_password
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Update to new password
  UPDATE admin_users 
  SET 
    password_hash = new_password,
    updated_at = now()
  WHERE email = admin_email;

  RETURN FOUND;
END;
$function$;
