-- Add admin role for ifterahman.web@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('5a432dc7-b0a7-46d8-95e0-572f9897df58', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;