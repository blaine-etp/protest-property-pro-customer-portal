-- Create security definer function to check if user can create owners
CREATE OR REPLACE FUNCTION public.can_create_owner(user_id_to_check uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    WHERE (
      (p.user_id = user_id_to_check AND p.authentication_token IS NOT NULL AND p.token_expires_at > now())
      OR 
      (p.user_id = auth.uid() AND user_id_to_check = auth.uid())
    )
  );
$$;

-- Update the RLS policy for owners INSERT to use the security definer function
DROP POLICY IF EXISTS "Users can insert owners with token or auth" ON public.owners;

CREATE POLICY "Users can insert owners with token or auth" 
ON public.owners 
FOR INSERT 
WITH CHECK (
  (created_by_user_id IS NOT NULL AND public.can_create_owner(created_by_user_id))
  OR 
  (auth.uid() IS NOT NULL AND created_by_user_id = auth.uid())
);