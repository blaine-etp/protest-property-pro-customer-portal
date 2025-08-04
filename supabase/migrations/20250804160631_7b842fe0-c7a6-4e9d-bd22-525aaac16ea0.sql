-- Add auto_appeal_enabled column to properties table
ALTER TABLE public.properties 
ADD COLUMN auto_appeal_enabled BOOLEAN NOT NULL DEFAULT false;