-- Add temporary policies to allow anyone to manage site content for testing
-- These will be removed once authentication is implemented

CREATE POLICY "Temporary: Anyone can insert site content" 
ON public.site_content 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Temporary: Anyone can update site content" 
ON public.site_content 
FOR UPDATE 
USING (true);

CREATE POLICY "Temporary: Anyone can delete site content" 
ON public.site_content 
FOR DELETE 
USING (true);