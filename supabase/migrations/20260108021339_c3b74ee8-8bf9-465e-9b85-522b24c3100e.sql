-- Fix concurrency issue in order number generation using advisory lock
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    next_num INTEGER;
    lock_obtained BOOLEAN;
BEGIN
    -- Handle case where empty string was passed - treat as null
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        -- Use advisory lock to prevent race conditions (lock id: 1001 for order numbers)
        lock_obtained := pg_try_advisory_xact_lock(1001);
        
        -- Even if we don't get lock immediately, wait for it
        IF NOT lock_obtained THEN
            PERFORM pg_advisory_xact_lock(1001);
        END IF;
        
        -- Get next sequential number
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 2) AS INTEGER)), 10000) + 1
        INTO next_num
        FROM public.orders
        WHERE order_number ~ '^#[0-9]+$';
        
        NEW.order_number := '#' || next_num::TEXT;
    END IF;
    
    RETURN NEW;
END;
$function$;