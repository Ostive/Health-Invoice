-- Create a sequence for invoice numbering
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    seq_num INT;
    new_invoice_number TEXT;
BEGIN
    -- Only generate if number is not provided or is empty
    IF NEW.number IS NULL OR NEW.number = '' THEN
        year_prefix := to_char(NOW(), 'YYYY');
        seq_num := nextval('invoice_number_seq');
        -- Format: FAC-YYYY-00001
        new_invoice_number := 'FAC-' || year_prefix || '-' || lpad(seq_num::text, 5, '0');
        NEW.number := new_invoice_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before insert
DROP TRIGGER IF EXISTS set_invoice_number ON invoices;
CREATE TRIGGER set_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();
