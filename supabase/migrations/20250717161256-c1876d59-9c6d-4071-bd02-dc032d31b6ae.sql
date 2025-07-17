-- Add SELECT policy to profiles table to allow foreign key validation during signup
CREATE POLICY "Allow foreign key validation for signup tokens"
ON public.profiles
FOR SELECT
USING (
  -- Allow SELECT for profiles with valid tokens (needed for foreign key validation)
  authentication_token IS NOT NULL 
  AND token_expires_at > now()
);