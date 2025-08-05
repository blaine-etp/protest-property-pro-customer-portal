-- Create evidence_uploads table
CREATE TABLE public.evidence_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  protest_id UUID,
  contact_id UUID,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  tax_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (for future auth implementation)
ALTER TABLE public.evidence_uploads ENABLE ROW LEVEL SECURITY;

-- Create public access policy (temporary for mock auth)
CREATE POLICY "Public access to all evidence data" 
ON public.evidence_uploads 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create storage bucket for property evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('property-evidence', 'property-evidence', false);

-- Create storage policies for evidence uploads
CREATE POLICY "Public access to evidence files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property-evidence');

CREATE POLICY "Anyone can upload evidence files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'property-evidence');

CREATE POLICY "Anyone can update evidence files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'property-evidence');

CREATE POLICY "Anyone can delete evidence files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'property-evidence');

-- Create trigger for updated_at
CREATE TRIGGER update_evidence_uploads_updated_at
BEFORE UPDATE ON public.evidence_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();