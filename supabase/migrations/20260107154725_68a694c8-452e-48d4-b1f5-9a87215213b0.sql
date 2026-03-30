-- First, fix any existing orders with empty order_number
UPDATE public.orders 
SET order_number = '#' || (
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 10000) + 1
  FROM public.orders
  WHERE order_number ~ '^#[0-9]+$'
)::TEXT
WHERE order_number = '' OR order_number IS NULL;

-- Drop the old trigger
DROP TRIGGER IF EXISTS set_order_number ON public.orders;

-- Create improved concurrency-safe function that also handles empty strings
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    next_num INTEGER;
BEGIN
    -- Handle case where empty string was passed - treat as null
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        -- Get next sequential number with FOR UPDATE to prevent race conditions
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 10000) + 1
        INTO next_num
        FROM public.orders
        WHERE order_number ~ '^#[0-9]+$';
        
        NEW.order_number := '#' || next_num::TEXT;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger that fires for NULL or empty string
CREATE TRIGGER set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();