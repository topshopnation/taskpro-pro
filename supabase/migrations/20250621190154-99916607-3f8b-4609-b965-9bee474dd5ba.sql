

-- Install the pgcrypto extension if not already available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the verify_admin_credentials function to use password hashing
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(input_email text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use crypt to verify the password against the stored hash
  RETURN EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE email = input_email 
    AND password_hash = crypt(input_password, password_hash)
  );
END;
$$;

-- Update the update_admin_password function to hash passwords
CREATE OR REPLACE FUNCTION public.update_admin_password(admin_email text, old_password text, new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Skip old password verification when old_password is empty
  IF old_password != '' THEN
    -- Verify the old password using crypt
    IF NOT EXISTS (
      SELECT 1 
      FROM admin_users 
      WHERE email = admin_email 
      AND password_hash = crypt(old_password, password_hash)
    ) THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Update to new hashed password using gen_salt for bcrypt
  UPDATE admin_users 
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE email = admin_email;

  RETURN FOUND;
END;
$$;

-- Update the add_admin_user function to hash passwords
CREATE OR REPLACE FUNCTION public.add_admin_user(admin_email text, admin_password text, admin_role text DEFAULT 'admin')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert with hashed password using bcrypt
  INSERT INTO admin_users (email, password_hash, role)
  VALUES (admin_email, crypt(admin_password, gen_salt('bf')), admin_role::text);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Note: Any existing admin passwords that were stored as plain text 
-- will need to be reset through the admin interface since we can't 
-- automatically detect and convert them without knowing the original values.

