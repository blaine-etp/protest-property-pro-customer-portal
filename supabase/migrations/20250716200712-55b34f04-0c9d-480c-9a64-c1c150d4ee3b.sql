-- Fix infinite recursion in owners RLS policy by creating security definer function
CREATE OR REPLACE FUNCTION public.can_access_owner(owner_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM properties pr
    JOIN profiles p ON (pr.user_id = p.user_id)
    WHERE pr.owner_id = owner_id
    AND (
      (p.authentication_token IS NOT NULL AND p.token_expires_at > now()) 
      OR 
      (p.user_id = auth.uid() AND p.is_authenticated = true)
    )
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view owners by token or auth" ON public.owners;
DROP POLICY IF EXISTS "Users can update owners by token or auth" ON public.owners;

-- Create new policies using the security definer function
CREATE POLICY "Users can view owners by token or auth" 
ON public.owners 
FOR SELECT 
USING (public.can_access_owner(id));

CREATE POLICY "Users can update owners by token or auth" 
ON public.owners 
FOR UPDATE 
USING (public.can_access_owner(id));