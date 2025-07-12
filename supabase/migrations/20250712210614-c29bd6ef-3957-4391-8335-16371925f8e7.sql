-- Create customer_documents table to track generated PDFs
CREATE TABLE public.customer_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'form-50-162',
  file_path TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'generated',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for customer documents
CREATE POLICY "Users can view their own documents by token or auth" 
ON public.customer_documents 
FOR SELECT 
USING (user_id IN ( 
  SELECT p.user_id
  FROM profiles p
  WHERE (((p.authentication_token IS NOT NULL) AND (p.token_expires_at > now())) OR ((p.user_id = auth.uid()) AND (p.is_authenticated = true)))
));

CREATE POLICY "Users can insert their own documents" 
ON public.customer_documents 
FOR INSERT 
WITH CHECK (user_id IN ( 
  SELECT p.user_id
  FROM profiles p
  WHERE ((p.authentication_token IS NOT NULL) AND (p.token_expires_at > now())) OR (p.user_id = auth.uid())
));

-- Create storage bucket for customer documents
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-documents', 'customer-documents', false);

-- Create policies for customer document storage
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'customer-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "System can upload customer documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'customer-documents');

-- Add trigger for timestamp updates
CREATE TRIGGER update_customer_documents_updated_at
BEFORE UPDATE ON public.customer_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();