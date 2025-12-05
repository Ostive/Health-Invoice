-- Add patient_id to invoices table
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON public.invoices(patient_id);

-- Update RLS policies if necessary (usually the existing owner check is enough, but good to verify)
-- The existing policy "Users can view own invoices" checks auth.uid() = user_id, which is still valid.
