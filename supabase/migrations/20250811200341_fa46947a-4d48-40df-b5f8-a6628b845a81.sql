-- Expand allowed permissions to include 'admin' while keeping backward compatibility
BEGIN;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_permissions;
ALTER TABLE public.profiles
  ADD CONSTRAINT check_permissions
  CHECK (permissions = ANY (ARRAY['user'::text, 'admin'::text, 'administrator'::text]));

-- Promote blaine+1@easytaxprotest.com to admin (short form)
DO $$
DECLARE
  v_user_id uuid;
  v_rows_updated int := 0;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower('blaine+1@easytaxprotest.com')
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found in auth.users', 'blaine+1@easytaxprotest.com';
  ELSE
    UPDATE public.profiles
    SET permissions = 'admin', updated_at = now()
    WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated = 0 THEN
      UPDATE public.profiles
      SET permissions = 'admin', updated_at = now()
      WHERE lower(email) = lower('blaine+1@easytaxprotest.com');
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    END IF;

    IF v_rows_updated = 0 THEN
      RAISE NOTICE 'No profile found to update for email %', 'blaine+1@easytaxprotest.com';
    ELSE
      RAISE NOTICE 'Updated % profile(s) to admin for email %', v_rows_updated, 'blaine+1@easytaxprotest.com';
    END IF;
  END IF;
END $$;
COMMIT;