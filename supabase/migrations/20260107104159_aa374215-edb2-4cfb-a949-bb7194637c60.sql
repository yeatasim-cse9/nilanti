-- Create incomplete_orders table for tracking abandoned checkouts
CREATE TABLE public.incomplete_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_area TEXT,
  delivery_zone_id UUID REFERENCES public.delivery_zones(id),
  notes TEXT,
  cart_data JSONB,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_converted BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;

-- Users can create/update their own incomplete orders
CREATE POLICY "Users can manage their own incomplete orders"
ON public.incomplete_orders
FOR ALL
USING (
  (auth.uid() = user_id) OR (session_id IS NOT NULL)
)
WITH CHECK (
  (auth.uid() = user_id) OR (session_id IS NOT NULL)
);

-- Admins can view all incomplete orders
CREATE POLICY "Admins can manage incomplete orders"
ON public.incomplete_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_incomplete_orders_session ON public.incomplete_orders(session_id);
CREATE INDEX idx_incomplete_orders_updated ON public.incomplete_orders(last_updated_at DESC);

-- Enable realtime for incomplete_orders
ALTER TABLE public.incomplete_orders REPLICA IDENTITY FULL;