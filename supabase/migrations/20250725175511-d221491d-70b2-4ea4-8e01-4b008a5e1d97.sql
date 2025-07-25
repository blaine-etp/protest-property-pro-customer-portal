-- Add contact and profile references to bills table
ALTER TABLE bills 
ADD COLUMN contact_id UUID REFERENCES contacts(id),
ADD COLUMN user_id UUID REFERENCES profiles(user_id);

-- Update the existing bill to reference the contact and profile
-- First, let's get the contact and user from the property associated with the protest
UPDATE bills 
SET contact_id = (
  SELECT p.contact_id 
  FROM protests pr 
  JOIN properties p ON pr.property_id = p.id 
  WHERE pr.id = bills.protest_id
),
user_id = (
  SELECT p.user_id 
  FROM protests pr 
  JOIN properties p ON pr.property_id = p.id 
  WHERE pr.id = bills.protest_id
)
WHERE protest_id IS NOT NULL;