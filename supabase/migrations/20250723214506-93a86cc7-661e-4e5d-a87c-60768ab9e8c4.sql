
-- Rename properties.address column to properties.situs_address
ALTER TABLE public.properties 
RENAME COLUMN address TO situs_address;

-- Update any indexes that might reference the old column name
-- (This is precautionary - there may not be any indexes on this column)
DROP INDEX IF EXISTS idx_properties_address;
CREATE INDEX IF NOT EXISTS idx_properties_situs_address ON public.properties(situs_address);
