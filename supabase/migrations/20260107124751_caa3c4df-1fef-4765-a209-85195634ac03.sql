-- Add Steadfast courier tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN steadfast_consignment_id TEXT,
ADD COLUMN steadfast_status TEXT,
ADD COLUMN courier_sent_at TIMESTAMP WITH TIME ZONE;