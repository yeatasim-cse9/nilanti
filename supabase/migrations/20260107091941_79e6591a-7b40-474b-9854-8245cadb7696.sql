-- Add admin role for ifterahman.web@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('0e91b0f7-90d5-45c4-9450-8dea7e97ccc2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;