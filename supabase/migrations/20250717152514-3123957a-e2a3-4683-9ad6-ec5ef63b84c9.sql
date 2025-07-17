-- Remove circular dependency: Remove property_id from owners table
ALTER TABLE public.owners DROP COLUMN IF EXISTS property_id;

-- Update can_access_owner function to use created_by_user_id instead of property relationship
CREATE OR REPLACE FUNCTION public.can_access_owner(owner_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM owners o
    JOIN profiles p ON (o.created_by_user_id = p.user_id)
    WHERE o.id = owner_id
    AND (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) 
      OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  );
$$;

-- Simplify owners INSERT policy to use created_by_user_id
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  -- Allow if created by user with valid token
  created_by_user_id IN (
    SELECT p.user_id 
    FROM profiles p 
    WHERE (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) 
      OR 
      (p.user_id = auth.uid())
    )
  )
);

-- Re-enable RLS on owners table with simplified policies
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;