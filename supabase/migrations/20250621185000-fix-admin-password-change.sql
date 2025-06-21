
-- Fix the update_admin_password function to work without pgcrypto extension
CREATE OR REPLACE FUNCTION public.update_admin_password(admin_email text, old_password text, new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- First verify the old password (simple text comparison for now)
  IF NOT EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = admin_email 
    AND password_hash = old_password
  ) THEN
    RETURN FALSE;
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
