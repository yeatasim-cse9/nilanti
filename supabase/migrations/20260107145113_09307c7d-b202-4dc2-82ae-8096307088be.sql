-- Add converted_order_id column to track which incomplete orders were converted to actual orders
ALTER TABLE public.incomplete_orders 
ADD COLUMN IF NOT EXISTS converted_order_id uuid REFERENCES public.orders(id) NULL;