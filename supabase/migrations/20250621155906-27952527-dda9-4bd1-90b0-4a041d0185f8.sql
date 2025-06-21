
-- First ensure the pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert or update the admin user with a properly hashed password
INSERT INTO admin_users (email, password_hash, role, created_at, updated_at)
VALUES (
  'admin@taskpro.pro', 
  crypt('admin123', gen_salt('bf')), 
  'admin'::admin_role, 
  now(), 
  now()
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = crypt('admin123', gen_salt('bf')),
  updated_at = now();
