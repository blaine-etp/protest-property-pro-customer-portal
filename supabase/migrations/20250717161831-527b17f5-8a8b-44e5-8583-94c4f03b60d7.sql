-- Remove the foreign key constraint that was causing authentication issues during signup
ALTER TABLE owners DROP CONSTRAINT owners_created_by_user_id_fkey;