-- =============================================================================
-- SHIVYAM MANAGEMENT SERVICES PRIVATE LIMITED
-- Migration: 20261029000001_admin_bootstrap.sql
-- Description: Assign primary CMS Administrator role to shivyam744@gmail.com
-- Instruction: Run this script AFTER shivyam744@gmail.com registers via auth.
-- =============================================================================

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'shivyam744@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
