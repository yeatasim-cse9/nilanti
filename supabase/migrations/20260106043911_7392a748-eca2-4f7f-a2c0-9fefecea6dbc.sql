-- Create chat_messages table for live chat
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    sender_type TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own chat messages
CREATE POLICY "Users can view their own chat messages"
ON public.chat_messages
FOR SELECT
USING (
    (auth.uid() = user_id) 
    OR (session_id IS NOT NULL AND sender_type = 'admin')
    OR has_role(auth.uid(), 'admin'::app_role)
);

-- Users can create chat messages
CREATE POLICY "Users can create chat messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Admins can manage all chat messages
CREATE POLICY "Admins can manage chat messages"
ON public.chat_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create chat_sessions table to track chat sessions
CREATE TABLE public.chat_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    is_active BOOLEAN DEFAULT true,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.chat_sessions
FOR SELECT
USING (
    (auth.uid() = user_id)
    OR has_role(auth.uid(), 'admin'::app_role)
);

-- Users can create sessions
CREATE POLICY "Users can create sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (true);

-- Admins can manage all sessions
CREATE POLICY "Admins can manage sessions"
ON public.chat_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update order number function to be simpler (just 5 digit number)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get next sequential number
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 10000) + 1
    INTO next_num
    FROM public.orders
    WHERE order_number ~ '^#[0-9]+$';
    
    NEW.order_number := '#' || next_num::TEXT;
    RETURN NEW;
END;
$function$;

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;