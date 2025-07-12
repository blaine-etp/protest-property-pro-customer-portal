-- Add mailing address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN mailing_address TEXT,
ADD COLUMN mailing_address_2 TEXT,
ADD COLUMN mailing_city TEXT,
ADD COLUMN mailing_state TEXT,
ADD COLUMN mailing_zip TEXT;

-- Create verification codes table
CREATE TABLE public.verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + '10 minutes'::interval),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on verification codes table
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for verification codes
CREATE POLICY "Users can view their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verification codes" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own verification codes" 
ON public.verification_codes 
FOR UPDATE 
USING (user_id = auth.uid());