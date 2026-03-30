-- Add steadfast_tracking_code column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS steadfast_tracking_code TEXT NULL;