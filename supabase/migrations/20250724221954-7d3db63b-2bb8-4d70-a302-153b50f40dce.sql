-- Standardize protest status values across the application
-- Update existing status values to use the new standardized system

-- Update legacy status values to standardized ones
UPDATE protests 
SET appeal_status = CASE 
  WHEN appeal_status = 'waiting_for_offer' THEN 'pending'
  WHEN appeal_status = 'offer_received' THEN 'offer_received'  -- Keep as is
  WHEN appeal_status = 'needs_review' THEN 'needs_review'       -- Keep as is  
  WHEN appeal_status = 'accepted' THEN 'accepted'               -- Keep as is
  WHEN appeal_status = 'rejected' THEN 'rejected'               -- Keep as is
  WHEN appeal_status = 'email_reply_required' THEN 'needs_review'
  WHEN appeal_status = 'filed' THEN 'in_progress'
  WHEN appeal_status = 'pending' THEN 'pending'                 -- Keep as is
  WHEN appeal_status = 'completed' THEN 'completed'             -- Keep as is
  WHEN appeal_status = 'in_progress' THEN 'in_progress'         -- Keep as is
  ELSE 'pending'  -- Default fallback
END
WHERE appeal_status IS NOT NULL;

-- Add a check constraint for valid status values (optional but recommended)
ALTER TABLE protests 
ADD CONSTRAINT protests_appeal_status_check 
CHECK (appeal_status IN ('pending', 'in_progress', 'offer_received', 'accepted', 'rejected', 'completed', 'needs_review'));