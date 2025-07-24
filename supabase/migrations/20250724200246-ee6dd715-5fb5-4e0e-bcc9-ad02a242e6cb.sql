-- Enable RLS on all tables that need it to fix security issues
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_properties ENABLE ROW LEVEL SECURITY;