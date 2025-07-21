
-- Add new columns to the protests table for the property tax workflow
ALTER TABLE public.protests 
ADD COLUMN IF NOT EXISTS situs_address text,
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS recommendation text,
ADD COLUMN IF NOT EXISTS offer_received_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS documents_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_packet_url text;

-- Update the protest status to use the new workflow statuses
ALTER TABLE public.protests DROP CONSTRAINT IF EXISTS protests_appeal_status_check;
ALTER TABLE public.protests DROP CONSTRAINT IF EXISTS protests_exemption_status_check;

-- Add new status constraint for the property tax workflow
ALTER TABLE public.protests ADD CONSTRAINT protests_appeal_status_check 
  CHECK (appeal_status IN ('waiting_for_offer', 'offer_received', 'needs_review', 'accepted', 'rejected', 'email_reply_required'));

-- Set default status if null
UPDATE public.protests SET appeal_status = 'waiting_for_offer' WHERE appeal_status IS NULL;
