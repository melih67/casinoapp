-- SQL script to make admin@casino.com an admin user
-- Run this in your Supabase SQL Editor

-- For Supabase auth.users table, we need to update the raw_user_meta_data
-- to include admin role information since auth.users doesn't have a direct role column
-- for custom application roles

-- Update the user's metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@casino.com';

-- Verify the change
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'admin@casino.com';

-- Note: The public.users table structure may be different
-- If you need to update public.users, you'll need to check its actual structure
-- and create a separate script based on how users are linked between auth.users and public.users

-- To check the public.users table structure, run:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public';

-- Example if public.users has different columns:
-- UPDATE public.users SET role = 'admin' WHERE [appropriate_column] = [appropriate_value];