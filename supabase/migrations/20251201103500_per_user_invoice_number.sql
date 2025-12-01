-- Add columns to profiles for invoice tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS invoice_counter INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_invoice_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER;

-- Drop old global sequence and function
DROP TRIGGER IF EXISTS set_invoice_number ON invoices;
DROP FUNCTION IF EXISTS generate_invoice_number();
DROP SEQUENCE IF EXISTS invoice_number_seq;

-- Create new per-user invoice number function
CREATE OR REPLACE FUNCTION generate_user_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER;
    user_seq INTEGER;
    new_invoice_number TEXT;
BEGIN
    -- Only generate if number is not provided or is empty
    IF NEW.number IS NULL OR NEW.number = '' THEN
        current_year := EXTRACT(YEAR FROM NOW())::INTEGER;
        
        -- Lock the profile row to prevent race conditions and update
        UPDATE public.profiles
        SET 
            invoice_counter = CASE 
                WHEN last_invoice_year = current_year THEN invoice_counter + 1
                ELSE 1
            END,
            last_invoice_year = current_year
        WHERE id = NEW.user_id
        RETURNING invoice_counter INTO user_seq;

        -- If profile doesn't exist (shouldn't happen due to triggers, but safety check)
        IF user_seq IS NULL THEN
            -- Fallback if profile is missing, though profile creation is enforced
            user_seq := 1;
        END IF;

        -- Format: FAC-YYYY-00001
        new_invoice_number := 'FAC-' || current_year || '-' || lpad(user_seq::text, 5, '0');
        NEW.number := new_invoice_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert OR update (if number is missing)
DROP TRIGGER IF EXISTS set_user_invoice_number ON invoices;
CREATE TRIGGER set_user_invoice_number
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_user_invoice_number();

-- Backfill existing users' counters to prevent collisions
DO $$
DECLARE
    r RECORD;
    max_num INTEGER;
    current_yr INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
BEGIN
    FOR r IN SELECT id FROM public.profiles LOOP
        -- Find max sequence for current year for this user
        -- We extract the numeric part from FAC-YYYY-XXXXX
        SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'FAC-' || current_yr || '-(\d+)') AS INTEGER)), 0)
        INTO max_num
        FROM invoices
        WHERE user_id = r.id
        AND number LIKE 'FAC-' || current_yr || '-%';
        
        -- Update profile with the found max number
        UPDATE public.profiles
        SET invoice_counter = max_num, last_invoice_year = current_yr
        WHERE id = r.id;
    END LOOP;
END $$;
