-- Check current RLS policies on owners table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'owners' AND schemaname = 'public';